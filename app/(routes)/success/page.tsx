// File: /app/success/page.tsx
import Link from 'next/link';
import { stripe } from '../../_lib/stripe';
import { redirect } from 'next/navigation';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'; // Import MailerSend components

// Initialize MailerSend with your API key from environment variables
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '', // Use a default empty string if not found to avoid TS errors, though it should be required
});

// Define your verified sender email address in MailerSend
const sender = new Sender(process.env.MAIL_FROM_ADDRESS || 'noreply@example.com', process.env.MAIL_FROM_NAME || 'Your Company Name'); // Add sender name and address env vars

async function sendBookingConfirmationEmail(bookingDetails: {
  customerEmail: string;
  sessionId: string;
  // Add other booking details you want in the email here:
  // carMake?: string;
  // carModel?: string;
  // pickupDate?: string;
  // dropoffDate?: string;
  // ... etc.
}) {
  console.log(`Attempting to send booking confirmation email to: ${bookingDetails.customerEmail}`);

  if (!process.env.MAILERSEND_API_KEY) {
      console.error('MAILERSEND_API_KEY is not set. Cannot send email.');
      // In production, you might want to log this error more formally or trigger an alert
      return; // Exit if API key is missing
  }

   if (!process.env.MAIL_FROM_ADDRESS) {
      console.error('MAIL_FROM_ADDRESS is not set. Cannot send email.');
      return; // Exit if sender address is missing
  }


  // Define the recipient
  const recipients = [new Recipient(bookingDetails.customerEmail)];

  // Construct the email content
  const emailSubject = 'Your Booking Confirmation!';
  const emailText = `
    Hello,

    Thank you for your booking!

    Your booking details for session ID ${bookingDetails.sessionId}:
    ${/* Add booking details here using bookingDetails object */''}
    ${/* Example: */''}
    ${/* Car: ${bookingDetails.carMake} ${bookingDetails.carModel} */''}
    ${/* Pickup: ${bookingDetails.pickupDate} */''}
    ${/* Dropoff: ${bookingDetails.dropoffDate} */''}
    ${/* ... other details ... */''}


    If you have any questions, please contact us.

    Best regards,
    Your Company Name
  `;

  const emailHtml = `
    <p>Hello,</p>
    <p>Thank you for your booking!</p>
    <p>Your booking details for session ID <strong>${bookingDetails.sessionId}</strong>:</p>
    ${/* Add HTML formatted booking details here using bookingDetails object */''}
    ${/* Example: */''}
    ${/* <p><strong>Car:</strong> ${bookingDetails.carMake} ${bookingDetails.carModel}</p> */''}
    ${/* <p><strong>Pickup Date:</strong> ${bookingDetails.pickupDate}</p> */''}
    ${/* <p><strong>Dropoff Date:</strong> ${bookingDetails.dropoffDate}</p> */''}
    ${/* ... other details ... */''}
    <p>If you have any questions, please contact us.</p>
    <p>Best regards,<br/>Your Company Name</p>
  `;


  // Create the email parameters
  const emailParams = new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject(emailSubject)
    .setText(emailText)
    .setHtml(emailHtml);

  try {
    // Send the email
    const response = await mailerSend.email.send(emailParams);
    console.log('Booking confirmation email sent successfully:', response);
  } catch (error: any) {
    console.error('Error sending booking confirmation email:', error);
    // Log detailed error response from MailerSend if available
    if (error.response?.body) {
        console.error('MailerSend error details:', error.response.body);
    }
    // Decide how to handle email sending failures (retry, alert, etc.)
  }
}


export default async function Success({ searchParams }: { searchParams: { session_id: string } }) {
  const { session_id } = await searchParams;

  if (!session_id) {
    // Log the error and redirect
    console.error('Missing session_id in success page search params');
    redirect('/'); // Redirect to home if session_id is missing
  }

  let session;
  try {
      // Retrieve session details from Stripe
      session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items', 'payment_intent', 'line_items.data.price.product'], // Expand product details if you need car info
      });
  } catch (error: any) {
      console.error(`Error retrieving Stripe session ${session_id}:`, error);
      // Handle cases where session retrieval fails (e.g., invalid session ID)
      // Redirect the user or show an error page
      redirect('/'); // Redirect to home or an error page
  }


  const { status, customer_details } = session;

  // Ensure customer_details and email exist
  const customerEmail = customer_details?.email;
  if (!customerEmail) {
      console.error(`Customer email not found for session ${session_id}`);
       // Decide how to handle missing email - redirect or show a message
       return (
           <section id="success">
             <p>Thank you for your booking! We could not retrieve your email address to send a confirmation.</p>
             <Link href={'/'} className="bg-blue-600 text-white px-4 py-2 rounded mt-4 inline-block">
               Back to Home
             </Link>
           </section>
       );
  }


  if (status === 'complete') {
    // Construct the booking details object
    const bookingDetails = {
      customerEmail: customerEmail, // Capture the email
      sessionId: session.id, // Include session ID for reference.
      // Populate car details from line items if expanded above
      carMake: (session.line_items?.data[0]?.price?.product as any)?.name, // Example: requires product expansion & type assertion
      // Add other relevant details fetched or stored in metadata if available
      // pickupDate: session.metadata?.pickupDate, // Example if stored in metadata
      // dropoffDate: session.metadata?.dropoffDate, // Example if stored in metadata
      // ... etc.
    };

    // Trigger the email sending function (on the server).
    // Use a non-blocking approach if email sending doesn't need to hold up the page render
    // Or await it if you want to be sure the email call started before returning the page HTML
    // For critical confirmations, awaiting is safer but adds latency.
    // Awaiting here is fine as it's a server component.
    await sendBookingConfirmationEmail(bookingDetails);

    return (
      <section id="success">
        <p>
          Thank you for your booking! A confirmation email will be sent to <strong>{customerEmail}</strong>.
        </p>
         {/* No mailto link needed */}
        <Link href={'/'} className="bg-blue-600 text-white px-4 py-2 rounded mt-4 inline-block">
          Back to Home
        </Link>
      </section>
    );
  }

  // If status is not 'complete', redirect or show a failure message
  console.warn(`Stripe session ${session_id} status is not complete: ${status}`);
  // Redirecting to home or a dedicated failure page is often better UX
  redirect('/');
  // return <p>Payment failed. Please try again.</p>; // Alternative: show a message
}