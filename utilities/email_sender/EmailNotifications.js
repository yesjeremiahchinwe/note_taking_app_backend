const MailService = require("./MailService");
const Constants = require("../constants");
const fs = require("fs");
const path = require("path");

class EmailNotifications {
  subject = "";
  templateName = "";
  to = "";
  mailService = {};
  templateVariables = [];

  constructor(templateName, to, subject, templateVariables) {
    this.templateName = templateName;
    this.to = to;
    this.subject = subject;
    this.templateVariables = templateVariables;

    this.mailService = new MailService();
  }

  async readTemplateFile(templateName, templateVariables) {
    const templateFilePath = path.join(__dirname, "templates", templateName);
    try {
      let templateContent = fs.readFileSync(templateFilePath, "utf-8");
      templateContent = !templateVariables.length
        ? templateContent
        : await this.replaceStrings(templateContent, templateVariables);
      return templateContent;
    } catch (error) {
      throw error;
    }
  }

  async replaceStrings(template, templateVariables) {
    return new Promise((resolve, reject) => {
      templateVariables.map((variable, index) => {
        template = template.replace(`***${index}***`, variable);
        if (index == templateVariables.length - 1) resolve(template);
      });
    });
  }

  async sendEmailNotification() {
    try {
      const templateFile = await this.readTemplateFile(
        this.templateName,
        this.templateVariables
      );

      const options = {
        to: this.to,
        subject: this.subject,
        html: templateFile,
      };

      return await this.mailService.sendMail(options);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmailNotifications
