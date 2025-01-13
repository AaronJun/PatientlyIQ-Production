import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sgMail from '@sendgrid/mail';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
    const SENDGRID_API_KEY = env.SENDGRID_API_KEY;
    if (!SENDGRID_API_KEY) {
        console.error('SendGrid API key not found');
        return json({ 
            success: false, 
            error: 'Email service configuration error. Please contact support.' 
        }, { status: 500 });
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    try {
        const formData = await request.json();
        
        const emailContent = `
New Contact Form Submission

Name: ${formData.firstName} ${formData.lastName}
Company: ${formData.company}
Position: ${formData.position}
Country: ${formData.country}
Phone: ${formData.phone || 'Not provided'}
Email: ${formData.email}
Reason: ${formData.reason}

Message:
${formData.message}
`;

        const msg = {
            to: 'aaron@patiently.studio',
            from: 'no-reply@patiently.studio', // Must be verified in SendGrid
            subject: `New Contact Form Submission - ${formData.reason}`,
            text: emailContent,
            replyTo: formData.email
        };

        await sgMail.send(msg);
        return json({ success: true });
        
      } catch (error) {
        console.error('SendGrid error:', error);
        let errorMessage = 'Failed to send message. Please try contacting us directly at aaron@patiently.studio';
        
        // Check for specific SendGrid errors
        if (error.response) {
            const { message, code } = error.response.body;
            console.error('SendGrid detailed error:', { message, code });
            
            // Handle specific error codes if needed
            if (code === 401) {
                errorMessage = 'Email service configuration error. Please contact support.';
            }
        }

        return json({ 
            success: false, 
            error: errorMessage 
        }, { status: 500 });
    }
};