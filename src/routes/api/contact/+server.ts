// src/routes/api/contact/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// You'll need to install and import your preferred email service
// Example using nodemailer:
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  // Configure with your SMTP settings
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: 'aaron@patiently.studio',
    pass: 'saJU8409++_++'
  }
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.json();
    
    const emailContent = `
      New Contact Form Submission
      
      Name: ${formData.firstName} ${formData.lastName}
      Company: ${formData.company}
      Position: ${formData.position}
      Country: ${formData.country}
      Phone: ${formData.phone}
      Email: ${formData.email}
      Reason: ${formData.reason}
      
      Message:
      ${formData.message}
    `;

    await transporter.sendMail({
      from: '"Patiently Studio Website" <noreply@patiently.studio>',
      to: 'aaron@patiently.studio',
      subject: `New Contact Form Submission from ${formData.firstName} ${formData.lastName}`,
      text: emailContent,
      replyTo: formData.email
    });

    return json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
};