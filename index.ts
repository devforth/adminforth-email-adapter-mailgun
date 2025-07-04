import type { EmailAdapter } from "adminforth";
import type { AdapterOptions } from "./types.js";
import formData from "form-data";
import Mailgun from "mailgun.js";

export default class EmailAdapterMailgun implements EmailAdapter {
  options: AdapterOptions;

  constructor(options: AdapterOptions) {
    this.options = options;
  }

  async validate() {
    if (!this.options.apiKey) {
      throw new Error("Mailgun apiKey is required");
    }
    if (!this.options.domain) {
      throw new Error("Mailgun domain is required");
    }
  }

  async sendEmail(
    from: string,
    to: string,
    text: string,
    html: string,
    subject: string
  ): Promise<{ error?: string; ok?: boolean }> {
    const mailgun = new Mailgun(formData);
    const client = mailgun.client({
      username: "api",
      key: this.options.apiKey,
      url: `https://${this.options.baseUrl}` || "https://api.mailgun.net",
    });

    try {
      await client.messages.create(this.options.domain, {
        from,
        to,
        subject,
        text,
        html,
      });
      return { ok: true };
    } catch (error: any) {
      console.error("Mailgun send error:", error);
      return {
        error: "Failed to send email",
        ok: false,
      };
    }
  }
}
