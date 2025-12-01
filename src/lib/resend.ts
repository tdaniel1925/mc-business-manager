import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email sending utility functions
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = "MCA System <noreply@yourdomain.com>",
  replyTo,
}: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email sending error:", err);
    throw err;
  }
}

// Pre-defined email templates
export const emailTemplates = {
  dealAssigned: (data: { dealId: string; merchantName: string; assignedTo: string }) => ({
    subject: `New Deal Assigned: ${data.merchantName}`,
    html: `
      <h2>New Deal Assigned</h2>
      <p>You have been assigned a new deal for <strong>${data.merchantName}</strong>.</p>
      <p>Deal ID: ${data.dealId}</p>
      <p>Please review the deal in the MCA Underwriting System.</p>
    `,
  }),

  docsRequested: (data: { merchantName: string; merchantEmail: string; requiredDocs: string[] }) => ({
    subject: `Documents Required - ${data.merchantName}`,
    html: `
      <h2>Documents Required for Your Application</h2>
      <p>Dear ${data.merchantName},</p>
      <p>We need the following documents to process your application:</p>
      <ul>
        ${data.requiredDocs.map(doc => `<li>${doc}</li>`).join("")}
      </ul>
      <p>Please upload these documents through your merchant portal.</p>
    `,
  }),

  dealApproved: (data: { merchantName: string; approvedAmount: string; factorRate: string }) => ({
    subject: `Congratulations! Your Application Has Been Approved`,
    html: `
      <h2>Application Approved</h2>
      <p>Dear ${data.merchantName},</p>
      <p>We're pleased to inform you that your application has been approved!</p>
      <p><strong>Approved Amount:</strong> ${data.approvedAmount}</p>
      <p><strong>Factor Rate:</strong> ${data.factorRate}</p>
      <p>You will receive your contract shortly for e-signature.</p>
    `,
  }),

  dealDeclined: (data: { merchantName: string; reasons?: string[] }) => ({
    subject: `Application Status Update`,
    html: `
      <h2>Application Status Update</h2>
      <p>Dear ${data.merchantName},</p>
      <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
      ${data.reasons ? `<p>Reasons: ${data.reasons.join(", ")}</p>` : ""}
      <p>You may reapply after 90 days or contact us for more information.</p>
    `,
  }),

  contractSent: (data: { merchantName: string; signingLink?: string }) => ({
    subject: `Contract Ready for Signature`,
    html: `
      <h2>Your Contract is Ready</h2>
      <p>Dear ${data.merchantName},</p>
      <p>Your contract is ready for electronic signature.</p>
      ${data.signingLink ? `<p><a href="${data.signingLink}">Click here to sign your contract</a></p>` : ""}
      <p>Please review and sign the contract to proceed with funding.</p>
    `,
  }),

  paymentReceived: (data: { merchantName: string; amount: string; remainingBalance: string }) => ({
    subject: `Payment Received - Thank You`,
    html: `
      <h2>Payment Received</h2>
      <p>Dear ${data.merchantName},</p>
      <p>We have received your payment of <strong>${data.amount}</strong>.</p>
      <p>Remaining Balance: ${data.remainingBalance}</p>
      <p>Thank you for your business!</p>
    `,
  }),

  paymentFailed: (data: { merchantName: string; amount: string; reason?: string }) => ({
    subject: `Payment Failed - Action Required`,
    html: `
      <h2>Payment Failed</h2>
      <p>Dear ${data.merchantName},</p>
      <p>Your scheduled payment of <strong>${data.amount}</strong> could not be processed.</p>
      ${data.reason ? `<p>Reason: ${data.reason}</p>` : ""}
      <p>Please ensure sufficient funds are available. We will retry the payment in 3 business days.</p>
    `,
  }),
};
