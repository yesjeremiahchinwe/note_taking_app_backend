const EmailNotifications = require("./EmailNotifications");

class EmailNotificationService {
  constructor() {
    // initialize as null; will hold an instance of EmailNotifications
    this.emailNotification = null;
  }

  async registrationEmail(to, clientName) {
    // create an instance of EmailNotifications
    this.emailNotification = new EmailNotifications(
      "template_welcome.html",
      to,
      "Welcome to NotesFlow",
      [clientName]
    );

    try {
      await this.emailNotification.sendEmailNotification();
    } catch (error) {
      console.error("Email Error", error);
    }
  }
}

module.exports = EmailNotificationService
