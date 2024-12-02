const nodemailer = require('nodemailer')
// import 'setimmediate';

const transporter = nodemailer.createTransport({
  port: 587,
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
})

const sendEmail = (email, subject, message) => {
  const htmlBody = "<h1> Welcome " + "<strong>" + email + "</strong>" + " to Notes</h1>" +
    "<p>" + message + "</p>"

  const mailData = {
    from: `Notes <${process.env.USER_EMAIL}>`,
    // to: 'austin.tech.space@gmail.com',
    to: email,
    replyTo: email,
    subject: subject,
    html: htmlBody
  }

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailData, (error, info) => {
      if (error) {
        reject(error);
        console.log(error);
      } else {
        resolve(info.response);
        console.log('Email sent successfully:', info.response);
      }
    })
  })
}

module.exports = { sendEmail }