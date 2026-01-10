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
      to: 'hello@subconsciousvalley.com', // Always send to this email
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
    to: 'hello@subconsciousvalley.com',
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
    to: 'hello@subconsciousvalley.com',
    subject: `New Newsletter Subscription: ${name}`,
    html: subscriptionHtml,
  };

  await transporter.sendMail(mailOptions);
  return NextResponse.json({ success: true, message: 'Subscription successful' });
}

export async function sendWelcomeEmail(userEmail, userName) {
  try {
    const firstName = userName?.split(' ')[0] || 'Friend';
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <p>Dear ${firstName},</p>
        
        <p><strong>Welcome to Subconscious Valley.</strong><br>
        I'm truly glad you're here.</p>
        
        <p>Before anything else, I want you to know this, this is your space.</p>
        
        <p>A space where you don't need to explain yourself, justify how you feel, or translate your emotions into words that don't quite fit. This is a space where healing is personal, gentle, and deeply understood.</p>
        
        <p><strong>I'd like to share why Subconscious Valley exists.</strong></p>
        
        <p>There was a time in my own life when everything looked "fine" on the outside, yet inside I carried unspoken emotions, unanswered questions, and a quiet longing for peace. That phase taught me something essential: real transformation doesn't begin on the surface, it begins in the subconscious.</p>
        
        <p>And the subconscious understands comfort.<br>
        It understands familiarity.<br>
        It understands the language of the heart.</p>
        
        <p>That is why Subconscious Valley was created as an audio-based therapeutic space, so healing can reach you even when you're tired, overwhelmed, or unable to put your feelings into words. This is also why our sessions are available in languages that feel natural to you, allowing your mind to feel safe before it begins to heal.</p>
        
        <p>For many, this may be the first time they experience therapeutic guidance in a language that truly feels like home. And that matters more than we often realize. When the mind feels safe and familiar, it opens more easily, absorbs more gently, and transforms more deeply.</p>
        
        <p><strong>Why is it important for me to be part of your journey?</strong></p>
        
        <p>Because healing should never feel lonely.<br>
        Because guidance matters when emotions feel heavy.<br>
        And because sometimes, all we need is a calm, reassuring voice, one that understands both the mind and emotions, without judgment.</p>
        
        <p>I don't see you as a "subscriber."<br>
        I see you as someone who has chosen themselves.<br>
        Someone ready to listen inward, heal softly, and grow at their own pace.</p>
        
        <p>As you explore Subconscious Valley, allow the audios to meet you where you are, during moments of stillness, stress, reflection, or rest. Let them work quietly in the background of your life, gently supporting you and helping you reconnect with the strength that already exists within you.</p>
        
        <p>This is not about fixing yourself; you are not broken.<br>
        This is about returning to yourself.</p>
        
        <p>Thank you for trusting this space.<br>
        Thank you for trusting your journey.</p>
        
        <p>With warmth and care,</p>
        
        <p><strong>Vanita</strong><br>
        Founder & Hypnotherapist<br>
        Subconscious Valley</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'Welcome to Subconscious Valley',
      html: welcomeHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}
