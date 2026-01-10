import { NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/mongodb";
import Purchase from "@/models/Purchase";
import Session from "@/models/Session";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parsing for webhooks
export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook verification error:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "invoice.payment_succeeded":
        // Handle subscription payments if needed
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // Handle subscription events if needed
        break;

      default:
      // Unhandled event type
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("Webhook processing error:", {
      message: error.message,
      stack: error.stack,
      eventType: event?.type,
      eventId: event?.id
    });
    return NextResponse.json(
      { error: "Webhook processing failed", eventId: event?.id, details: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session) {
  try {
    console.log('Processing checkout completed for session:', session.id);
    console.log('Session metadata:', session.metadata);
    
    // Check if purchase already exists to prevent duplicates
    const existingPurchase = await Purchase.findOne({
      $or: [
        { stripe_payment_intent_id: session.payment_intent },
        { stripe_checkout_session_id: session.id }
      ]
    });

    if (existingPurchase) {
      console.log('Purchase already exists, skipping');
      return;
    }

    // Get detailed payment information
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent
    );
    const paymentMethod =
      paymentIntent.charges?.data[0]?.payment_method_details;

    // Get transaction fee details
    const stripeFee = paymentIntent.charges?.data[0]?.balance_transaction
      ? await stripe.balanceTransactions.retrieve(
          paymentIntent.charges.data[0].balance_transaction
        )
      : null;

    const transactionFee = stripeFee ? stripeFee.fee / 100 : 0;
    const netAmount = session.amount_total / 100 - transactionFee;

    const purchaseData = {
      session_id: session.metadata?.sessionId || session.id,
      session_title: session.metadata?.sessionTitle,
      child_session_id: session.metadata?.childId || null,
      child_session_title: session.metadata?.childTitle || null,
      user_email: session.customer_email || session.metadata?.userEmail,
      user_name: session.metadata?.userName || session.customer_details?.name,
      amount_paid: session.amount_total / 100,
      currency: session.currency?.toUpperCase(),
      payment_status: "completed",
      stripe_payment_intent_id: session.payment_intent,
      stripe_checkout_session_id: session.id,
      payment_method: paymentMethod?.type,
      transaction_fee: transactionFee,
      net_amount: netAmount,
      customer_ip:
        paymentIntent.charges?.data[0]?.outcome?.network_status || null,
      billing_address: {
        country: session.customer_details?.address?.country,
        postal_code: session.customer_details?.address?.postal_code,
        state: session.customer_details?.address?.state,
        city: session.customer_details?.address?.city,
        line1: session.customer_details?.address?.line1,
        line2: session.customer_details?.address?.line2,
      },
      payment_details: {
        card_brand: paymentMethod?.card?.brand,
        card_last4: paymentMethod?.card?.last4,
        card_exp_month: paymentMethod?.card?.exp_month,
        card_exp_year: paymentMethod?.card?.exp_year,
        card_country: paymentMethod?.card?.country,
      },
      access_granted: true,
      purchase_date: new Date(session.created * 1000),
    };

    try {
      await Purchase.create(purchaseData);
    } catch (duplicateError) {
      if (duplicateError.code === 11000) {
        console.log('Duplicate purchase detected, ignoring');
        return;
      }
      throw duplicateError;
    }

    // Send purchase confirmation email
    console.log('Sending customer confirmation email...');
    await sendPurchaseConfirmationEmail(session, purchaseData);

    // Send purchase notification to owner
    console.log('Sending owner notification email...');
    await sendOwnerPurchaseNotification(session, purchaseData);
  } catch (error) {
    // Log error to purchase record if possible
    try {
      await Purchase.findOneAndUpdate(
        { stripe_payment_intent_id: session.payment_intent },
        {
          $set: {
            error_details: {
              error_code: error.code || "WEBHOOK_ERROR",
              error_message: error.message,
              error_date: new Date(),
            },
          },
        },
        { upsert: false }
      );
    } catch (logError) {
      // Silent fail for error logging
    }

    throw error;
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  try {
    // Update purchase status if it exists
    const purchase = await Purchase.findOne({
      stripe_payment_intent_id: paymentIntent.id,
    });

    if (purchase && purchase.payment_status !== "completed") {
      purchase.payment_status = "completed";
      purchase.access_granted = true;
      await purchase.save();
    }
  } catch (error) {
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent) {
  try {
    // Get failure details
    const failureCode = paymentIntent.last_payment_error?.code;
    const failureMessage = paymentIntent.last_payment_error?.message;
    const declineCode = paymentIntent.last_payment_error?.decline_code;

    // Update or create purchase record with failure details
    const purchaseUpdate = {
      payment_status: "failed",
      access_granted: false,
      error_details: {
        error_code: failureCode || declineCode || "PAYMENT_FAILED",
        error_message: failureMessage || "Payment failed",
        error_date: new Date(),
      },
    };

    const purchase = await Purchase.findOneAndUpdate(
      { stripe_payment_intent_id: paymentIntent.id },
      { $set: purchaseUpdate },
      { new: true, upsert: false }
    );

    if (!purchase) {
      // Create failed purchase record if it doesn't exist
      const failedPurchaseData = {
        session_id: paymentIntent.metadata?.sessionId,
        session_title: paymentIntent.metadata?.sessionTitle,
        user_email: paymentIntent.metadata?.userEmail,
        user_name: paymentIntent.metadata?.userName,
        amount_paid: paymentIntent.amount / 100,
        currency: paymentIntent.currency?.toUpperCase(),
        payment_status: "failed",
        stripe_payment_intent_id: paymentIntent.id,
        access_granted: false,
        error_details: {
          error_code: failureCode || declineCode || "PAYMENT_FAILED",
          error_message: failureMessage || "Payment failed",
          error_date: new Date(),
        },
        purchase_date: new Date(paymentIntent.created * 1000),
      };

      await Purchase.create(failedPurchaseData);
    }

    // Send payment failure email
    await sendPaymentFailureEmail(paymentIntent, failureCode, failureMessage);
  } catch (error) {
    throw error;
  }
}

async function sendPurchaseConfirmationEmail(session, purchaseData) {
  try {
    // Only send email if we have a valid user email
    if (!purchaseData.user_email) {
      console.log("No user email found, skipping purchase confirmation email");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Thank you for your purchase!</h2>
        <p>Dear ${purchaseData.user_name || "Customer"},</p>
        <p>Your purchase has been confirmed. Here are the details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Purchase Details</h3>
          <p><strong>Session:</strong> ${purchaseData.session_title}</p>
          <p><strong>Amount:</strong> ${purchaseData.amount_paid} ${
      purchaseData.currency
    }</p>
          <p><strong>Payment ID:</strong> ${session.payment_intent}</p>
          <p><strong>Purchase Date:</strong> ${new Date(
            purchaseData.purchase_date
          ).toLocaleDateString()}</p>
        </div>
        
        <p>You can now access your session in your dashboard at <a href="https://subconsciousvalley.com/dashboard">subconsciousvalley.com/dashboard</a></p>
        
        <p>If you have any questions, feel free to contact us at hello@subconsciousvalley.com</p>
        
        <p>Best regards,<br><strong>Subconscious Valley Team</strong></p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: purchaseData.user_email,
      subject: "Purchase Confirmation - Subconscious Valley",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      "Purchase confirmation email sent to:",
      purchaseData.user_email
    );
  } catch (error) {
    console.error("Error sending purchase confirmation email:", error);
  }
}

async function sendPaymentFailureEmail(
  paymentIntent,
  failureCode,
  failureMessage
) {
  try {
    const userEmail = paymentIntent.metadata?.userEmail;

    // Only send email if we have a valid user email
    if (!userEmail) {
      console.log("No user email found, skipping payment failure email");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const userName = paymentIntent.metadata?.userName || "Customer";
    const sessionTitle = paymentIntent.metadata?.sessionTitle;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Payment Failed - Subconscious Valley</h2>
        <p>Dear ${userName},</p>
        <p>We're sorry, but your payment for "${sessionTitle}" could not be processed.</p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <h3 style="margin-top: 0; color: #DC2626;">Payment Details</h3>
          <p><strong>Session:</strong> ${sessionTitle}</p>
          <p><strong>Amount:</strong> ${
            paymentIntent.amount / 100
          } ${paymentIntent.currency?.toUpperCase()}</p>
          <p><strong>Reason:</strong> ${
            failureMessage || "Payment declined"
          }</p>
        </div>
        
        <p>Please try again with a different payment method or contact your bank if the issue persists.</p>
        
        <p><a href="https://subconsciousvalley.com/sessions" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Try Again</a></p>
        
        <p>If you continue to experience issues, please contact us at hello@subconsciousvalley.com</p>
        
        <p>Best regards,<br><strong>Subconscious Valley Team</strong></p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: "Payment Failed - Subconscious Valley",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log("Payment failure email sent to:", userEmail);
  } catch (error) {
    console.error("Error sending payment failure email:", error);
  }
}

async function sendOwnerPurchaseNotification(session, purchaseData) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Purchase - Subconscious Valley</h2>
        <p>A new purchase has been completed on your platform.</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #059669;">Purchase Details</h3>
          <p><strong>Customer:</strong> ${purchaseData.user_name} (${
      purchaseData.user_email
    })</p>
          <p><strong>Session:</strong> ${purchaseData.session_title}</p>
          <p><strong>Amount:</strong> ${purchaseData.amount_paid} ${
      purchaseData.currency
    }</p>
          <p><strong>Net Amount:</strong> ${purchaseData.net_amount} ${
      purchaseData.currency
    }</p>
          <p><strong>Transaction Fee:</strong> ${
            purchaseData.transaction_fee
          } ${purchaseData.currency}</p>
          <p><strong>Payment Method:</strong> ${
            purchaseData.payment_method || "card"
          }</p>
          <p><strong>Payment ID:</strong> ${session.payment_intent}</p>
          <p><strong>Purchase Date:</strong> ${new Date(
            purchaseData.purchase_date
          ).toLocaleString()}</p>
        </div>
        
        <p>Customer billing address: ${purchaseData.billing_address?.city}, ${
      purchaseData.billing_address?.country
    }</p>
        
        <p>Best regards,<br><strong>Subconscious Valley System</strong></p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: "hello@subconsciousvalley.com",
      subject: `New Purchase: ${purchaseData.session_title} - ${purchaseData.amount_paid} ${purchaseData.currency}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      "Owner purchase notification sent to: hello@subconsciousvalley.com"
    );
  } catch (error) {
    console.error("Error sending owner purchase notification:", error);
  }
}
