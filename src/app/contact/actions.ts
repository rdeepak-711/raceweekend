'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import nodemailer from 'nodemailer';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
  message?: string | null;
  success?: boolean;
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Send Message.',
    };
  }

  const { name, email, subject, message } = validatedFields.data;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject || 'No Subject');
  const safeMessage = escapeHtml(message);

  try {
    // 1. Save to Database
    await db.insert(contacts).values({
      name,
      email,
      subject: subject || 'No Subject',
      message,
    });

    // 2. Trigger SMTP Email if configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"${name}" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        subject: `New Contact Form: ${subject || 'No Subject'}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage.replace(/\n/g, '<br>')}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return {
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
    };
  } catch (error) {
    console.error('Database/SMTP Error:', error);
    return {
      message: 'Database Error: Failed to Send Message.',
    };
  }
}
