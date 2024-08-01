import nodemailer from "nodemailer";


export async function sendEmail(message, name, phone) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "abdelrahmanmohammed851@gmail.com",
      pass: "ykejlphmzcmmwlgw",
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `User " <abdelrahmanmohammed851@gmail.com>`, // sender address
    to: "ahmed.osama.swe@gmail.com", // list of receivers
    subject: "Help Center", // Subject line
    text: `Content :${message} , 
    User Name: ${name}, 
    Phone: ${phone}`, // plain text body
  });

  console.log("Message sent: %s", info.messageId);

}
