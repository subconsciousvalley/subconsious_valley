import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'feedback') {
      return await handleFeedback(body);
    }

    if (type === 'subscribe') {
      return await handleSubscription(body);
    }

    // Default contact form handling
    const { fullName, email, preferredLanguage, subject, message } = body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailHtml = `
      <h3>New message from Subconscious Valley contact form:</h3>
      <hr>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Preferred Language:</strong> ${preferredLanguage}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'hello@subconsciousvalley.com;sajid.azure@gmail.com', // Always send to this email
      // to: 'sajid.azure@gmail.com', // Always send to this email
      replyTo: email, // Allow replying to customer
      subject: `New Contact Form Submission: ${subject}`,
      text: `New message from Subconscious Valley contact form:\n-------------------------------------------------\nName: ${fullName}\nEmail: ${email}\nPreferred Language: ${preferredLanguage}\nSubject: ${subject}\n-------------------------------------------------\nMessage:\n${message}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

async function handleFeedback(data) {
  const { sessionTitle, userEmail, happiness, calmness, mindState, didSleep, improvement, listenAgain, comments } = data;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const feedbackHtml = `
    <h3>New Session Feedback from Subconscious Valley:</h3>
    <hr>
    <p><strong>User:</strong> ${userEmail || 'Unknown User'}</p>
    <p><strong>Session:</strong> ${sessionTitle || 'Unknown Session'}</p>
    <hr>
    <p><strong>1. Happiness/Peace Level:</strong> ${happiness}</p>
    <p><strong>2. Calmness Level:</strong> ${calmness}</p>
    <p><strong>3. State of Mind:</strong> ${mindState}</p>
    <p><strong>4. Did Sleep:</strong> ${didSleep}</p>
    <p><strong>5. Emotional Improvement:</strong> ${improvement}</p>
    <p><strong>6. Listen Again:</strong> ${listenAgain}</p>
    ${comments ? `<p><strong>7. Comments:</strong><br>${comments.replace(/\n/g, '<br>')}</p>` : ''}
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: 'hello@subconsciousvalley.com;sajid.azure@gmail.com',
    subject: `Session Feedback: ${sessionTitle || 'Unknown Session'}`,
    html: feedbackHtml,
  };

  await transporter.sendMail(mailOptions);
  return NextResponse.json({ success: true, message: 'Feedback sent successfully' });
}

async function handleSubscription(data) {
  const { name, email, phone } = data;  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    
  });

  const subscriptionHtml = `
    <h3>New Newsletter Subscription from Subconscious Valley:</h3>
    <hr>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <hr>
    <p><em>This user has subscribed to receive updates and special offers from Subconscious Valley.</em></p>
  `;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: 'subconsciousvalley@gmail.com;sajid.azure@gmail.com',
    subject: `New Newsletter Subscription: ${name}`,
    html: subscriptionHtml,
  };

  await transporter.sendMail(mailOptions);
  return NextResponse.json({ success: true, message: 'Subscription successful' });
}