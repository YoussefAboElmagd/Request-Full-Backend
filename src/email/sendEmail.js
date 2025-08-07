import nodemailer from "nodemailer";
import { emailTemplate } from "./emailTemp.js";
import { sendNotification } from "../utils/sendNotification.js";
// import { userModel } from "../../database/models/user.model.js";

export async function sendEmail(email, text) {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // Hostinger SMTP server
    port: 465, // Use 587 for TLS or 465 for SSL
    secure: true, // Set true for port 465
    auth: {
      user: "support@request-sa.com", // Your Hostinger email address
      pass: "ASDasdasd@10", // Your Hostinger email password
    },
  });
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: "abdelrahmanmohammed851@gmail.com",
  //     pass: "ykejlphmzcmmwlgw",
  //   },
  // });
  // <support@request-sa.com>
  const info = await transporter.sendMail({
    from: `Admin " <support@request-sa.com>`, // sender address
    to: `${email}`, // list of receivers
    subject: "Email Verification", // Subject line
    text: `${text}`, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
}
export async function sendEmailTOAssistant(email, password) {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // Hostinger SMTP server
    port: 465, // Use 587 for TLS or 465 for SSL
    secure: true, // Set true for port 465
    auth: {
      user: "support@request-sa.com", // Your Hostinger email address
      pass: "ASDasdasd@10", // Your Hostinger email password
    },
  });
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     user: "abdelrahmanmohammed851@gmail.com",
  //     pass: "ykejlphmzcmmwlgw",
  //   },
  // });
  // <support@request-sa.com>
  const info = await transporter.sendMail({
    from: `Admin " <support@request-sa.com>`, // sender address
    to: `${email}`, // list of receivers
    subject: "Email Verification", // Subject line
    text: `You have been added as an assistant in the request dashboard.
Please log in using your email and the following password: ${password}`, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
}
export async function sendInvite(recipient, projectName, roleName, id, link) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // Hostinger SMTP server
      port: 465, // Use 587 for TLS or 465 for SSL
      secure: true, // Set true for port 465
      auth: {
        user: "support@request-sa.com", // Your Hostinger email address
        pass: "ASDasdasd@10", // Your Hostinger email password
      },
    });

    const info = await transporter.sendMail({
      from: `Admin " <support@request-sa.com>`,
      to: recipient.email,
      subject: "Invitation Email",
      text: `You have been invited to ${projectName} as ${roleName}.
        the link ${link}?id=${id}.`,
    });

    // await Promise.all(info);
    console.log("All emails sent successfully!");
  } catch (error) {
    console.error("Error sending emails:", error);
  }
}
export async function reesendInvite(email, projectName, roleName, link) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // Hostinger SMTP server
      port: 465, // Use 587 for TLS or 465 for SSL
      secure: true, // Set true for port 465
      auth: {
        user: "support@request-sa.com", // Your Hostinger email address
        pass: "ASDasdasd@10", // Your Hostinger email password
      },
    });

    const info = await transporter.sendMail({
      from: `Admin " <support@request-sa.com>`,
      to: email,
      subject: "Invitation Email",
      text: `You have been invited again to ${projectName} as ${roleName}.
        the link ${link}.`,
    });

    // await Promise.all(info);
    console.log("All emails sent successfully!");
  } catch (error) {
    console.error("Error sending emails:", error);
  }
}

export async function contactUs(name, email, message, id) {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // Hostinger SMTP server
    port: 465, // Use 587 for TLS or 465 for SSL
    secure: true, // Set true for port 465
    auth: {
      user: "support@request-sa.com", // Your Hostinger email address
      pass: "ASDasdasd@10", // Your Hostinger email password
    },
  });

  const messageEmail = await transporter.sendMail({
    from: `Help Center" <support@request-sa.com>`,
    to: "support@request-sa.com",
    subject: "contact us",
    html: emailTemplate(name, email, message),
  });
  let message_en = ` Your Message has been successfully submitted to support, and we will contact you as soon as possible `;
  let message_ar =
    "لقد تم إرسال رسالتك بنجاح إلى الدعم، وسوف نقوم بالتواصل معك في أقرب وقت ممكن ";
  sendNotification(message_en, message_ar, "support", id);
  console.log("Message sent: %s", messageEmail.messageId);
}
export async function contactUs2(name, email, phone, message) {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // Hostinger SMTP server
    port: 465, // Use 587 for TLS or 465 for SSL
    secure: true, // Set true for port 465
    auth: {
      user: "support@request-sa.com", // Your Hostinger email address
      pass: "ASDasdasd@10", // Your Hostinger email password
    },
  });

  // Create HTML template for the email
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Us Form Submission</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #007bff;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
                margin: -30px -30px 30px -30px;
            }
            .field-group {
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-left: 4px solid #007bff;
                border-radius: 4px;
            }
            .field-label {
                font-weight: bold;
                color: #007bff;
                display: block;
                margin-bottom: 5px;
                font-size: 14px;
                text-transform: uppercase;
            }
            .field-value {
                font-size: 16px;
                color: #333;
                word-wrap: break-word;
            }
            .message-field {
                background-color: #fff;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-top: 10px;
                white-space: pre-wrap;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                color: #666;
                font-size: 12px;
            }
            .timestamp {
                color: #999;
                font-size: 12px;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Contact Form Submission</h1>
            </div>
            
            <div class="field-group">
                <span class="field-label">👤 Name</span>
                <div class="field-value">${name || "Not provided"}</div>
            </div>
            
            <div class="field-group">
                <span class="field-label">📧 Email</span>
                <div class="field-value">
                    <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">
                        ${email || "Not provided"}
                    </a>
                </div>
            </div>
            
            <div class="field-group">
                <span class="field-label">📞 Phone</span>
                <div class="field-value">
                    <a href="tel:${phone}" style="color: #007bff; text-decoration: none;">
                        ${phone || "Not provided"}
                    </a>
                </div>
            </div>
            
            <div class="field-group">
                <span class="field-label">💬 Message</span>
                <div class="field-value">
                    <div class="message-field">
                        ${message || "No message provided"}
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>This message was sent from your website contact form.</p>
                <div class="timestamp">
                    Received: ${new Date().toLocaleString()}
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    const messageEmail = await transporter.sendMail({
      from: `"Help Center" <support@request-sa.com>`, // Fixed the quote syntax
      to: "a7med3li0111@gmail.com",
      subject: `New Contact Form Submission from ${name || "Website Visitor"}`,
      html: htmlTemplate,
      // Optional: Add plain text version for better compatibility
      text: `
        New Contact Form Submission
        
        Name: ${name || "Not provided"}
        Email: ${email || "Not provided"}
        Phone: ${phone || "Not provided"}
        Message: ${message || "No message provided"}
        
        Received: ${new Date().toLocaleString()}
      `,
    });

    console.log("Email sent successfully:", messageEmail.messageId);
    return {
      success: true,
      messageId: messageEmail.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
