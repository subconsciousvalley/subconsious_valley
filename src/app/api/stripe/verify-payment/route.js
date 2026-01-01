import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Purchase from '@/models/Purchase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sessionId, productSessionId, sessionTitle, childId } = await request.json();

    // Retrieve checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    await dbConnect();

    // Check if purchase already exists
    const existingPurchase = await Purchase.findOne({
      stripe_payment_intent_id: checkoutSession.payment_intent
    });

    if (!existingPurchase) {
      // Get payment intent details for comprehensive data
      const paymentIntent = await stripe.paymentIntents.retrieve(checkoutSession.payment_intent);
      const paymentMethod = paymentIntent.charges?.data[0]?.payment_method_details;
      
      // Calculate transaction fee (Stripe's fee)
      const stripeFee = paymentIntent.charges?.data[0]?.balance_transaction 
        ? await stripe.balanceTransactions.retrieve(paymentIntent.charges.data[0].balance_transaction)
        : null;
      
      const transactionFee = stripeFee ? stripeFee.fee / 100 : 0;
      const netAmount = (checkoutSession.amount_total / 100) - transactionFee;
      
      // Create comprehensive purchase record
      const purchaseData = {
        session_id: productSessionId,
        session_title: sessionTitle || 'Unknown Session',
        child_session_id: checkoutSession.metadata?.childId && checkoutSession.metadata.childId !== '' ? checkoutSession.metadata.childId : null,
        child_session_title: checkoutSession.metadata?.childTitle && checkoutSession.metadata.childTitle !== '' ? checkoutSession.metadata.childTitle : null,
        user_email: checkoutSession.customer_email || session.user.email,
        user_name: checkoutSession.customer_details?.name || session.user.name || '',
        amount_paid: checkoutSession.amount_total / 100,
        currency: checkoutSession.currency?.toUpperCase() || 'USD',
        payment_status: 'completed',
        stripe_payment_intent_id: checkoutSession.payment_intent,
        stripe_checkout_session_id: checkoutSession.id,
        payment_method: paymentMethod?.type || 'card',
        transaction_fee: transactionFee,
        net_amount: netAmount,
        customer_ip: paymentIntent.charges?.data[0]?.billing_details?.address?.country || null,
        billing_address: {
          country: checkoutSession.customer_details?.address?.country,
          postal_code: checkoutSession.customer_details?.address?.postal_code,
          state: checkoutSession.customer_details?.address?.state,
          city: checkoutSession.customer_details?.address?.city,
          line1: checkoutSession.customer_details?.address?.line1,
          line2: checkoutSession.customer_details?.address?.line2,
        },
        payment_details: {
          card_brand: paymentMethod?.card?.brand,
          card_last4: paymentMethod?.card?.last4,
          card_exp_month: paymentMethod?.card?.exp_month,
          card_exp_year: paymentMethod?.card?.exp_year,
          card_country: paymentMethod?.card?.country,
        },
        access_granted: true,
        purchase_date: new Date(checkoutSession.created * 1000),
      };

      await Purchase.create(purchaseData);
    }

    return NextResponse.json({
      sessionId: checkoutSession.id,
      paymentStatus: checkoutSession.payment_status,
      paymentIntent: checkoutSession.payment_intent,
      customerEmail: checkoutSession.customer_email,
      amountTotal: checkoutSession.amount_total / 100,
      currency: checkoutSession.currency?.toUpperCase(),
      purchaseRecorded: true,
    });

  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}