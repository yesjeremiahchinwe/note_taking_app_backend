const Constants = require("../constants");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

class MailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.SMTP_CLIENT_ID,
      process.env.SMTP_CLIENT_SECRET,
      process.env.SMTP_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.SMTP_REFRESH_TOKEN,
    });
  }

  // Create transporter inside an async function (so we can await token)
  async createTransporter() {
    const accessToken = await this.oauth2Client.getAccessToken();

    return nodemailer.createTransport({
      host: Constants.emailCredentials.host,
      port: Number(Constants.emailCredentials.port),
      secure: true,
      tls: {
        rejectUnauthorized: false,
      },

      service: "gmail",
      auth: {
        type: "OAuth2",
        user: Constants.emailCredentials.username,
        clientId: Constants.emailCredentials.clientId,
        clientSecret: Constants.emailCredentials.clientSecret,
        refreshToken: Constants.emailCredentials.refreshToken,
        accessToken: accessToken.token, // generated fresh every time
      },
    });
  }

  // Main sendMail function
  async sendMail(options) {
    try {
      const transporter = await this.createTransporter();

      const info = await transporter.sendMail({
        from: `NotesFlow <${Constants.emailCredentials.username}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      return info;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MailService;
