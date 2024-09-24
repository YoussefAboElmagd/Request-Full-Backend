import nodemailer from "nodemailer";
import { emailTemplate } from "./emailTemp.js";
// import { userModel } from "../../database/models/user.model.js";

export async function sendEmail(email,code) {
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
    text: `Email Verification Code: ${code}`, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
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