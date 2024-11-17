import nodemailer from "nodemailer";
import { emailTemplate } from "./emailTemp.js";
// import { userModel } from "../../database/models/user.model.js";

export async function sendEmail(email,text) {
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "abdelrahmanmohammed851@gmail.com",
      pass: "ykejlphmzcmmwlgw",
    },
  });

  const info = await transporter.sendMail({
    from: `Admin " <abdelrahmanmohammed851@gmail.com>`, // sender address
    to: `${email}`, // list of receivers
    subject: "Email Verification", // Subject line
    text: `${text}`, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
}
export async function sendInvite(recipient,projectName,roleName,link) {
  try {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "abdelrahmanmohammed851@gmail.com",
      pass: "ykejlphmzcmmwlgw",
    },
  });

  const info = await transporter.sendMail({
      from: `Admin " <abdelrahmanmohammed851@gmail.com>`,
      to: recipient.email, 
      subject: 'Invitation Email',
      text: `You have been invited to ${projectName} as ${roleName}.
        the link ${link}.`,
    });

  await Promise.all(info);
    console.log('All emails sent successfully!');
  } catch (error) {
    console.error('Error sending emails:', error);
  }
}

export async function contactUs(name,email,message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "abdelrahmanmohammed851@gmail.com",
      pass: "ykejlphmzcmmwlgw",
    },
  });

  const messageEmail = await transporter.sendMail({
    from: `Help Center" <abdelrahmanmohammed851@gmail.com>`,
    to: "abdelrahmanmohammed8511@gmail.com", 
    subject: "contact us", 
    html: emailTemplate(name,email,message),
  });

  console.log("Message sent: %s", messageEmail.messageId);

}
export async function contactUs2(name,email,phone,message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "abdelrahmanmohammed851@gmail.com",
      pass: "ykejlphmzcmmwlgw",
    },
  });

  const messageEmail = await transporter.sendMail({
    from: `Help Center" <abdelrahmanmohammed851@gmail.com>`,
    to: "abdelrahmanmohammed8511@gmail.com", 
    subject: "contact us", 
    html: emailTemplate(name,email,phone,message),
  });

  console.log("Message sent: %s", messageEmail.messageId);

}