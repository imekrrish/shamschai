import nodemailer, { Transporter } from 'nodemailer';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const frontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const logoPath = path.resolve(__dirname, '../../../public/assets/shams/brand/chai-mark.svg');
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] || character));

export function createEmailToken() {
  const token = randomBytes(32).toString('hex');
  return { token, hash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
}

function layout(title: string, content: string) {
  const logo = existsSync(logoPath) ? `<img src="cid:shams-chai-logo" alt="Sham's Chai" style="width:64px;height:64px">` : `<div style="color:#c89b4b;font-size:25px;font-weight:bold;letter-spacing:.08em">SHAM'S CHAI</div>`;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;background:#f4eee3;color:#171815;font-family:Georgia,serif"><div style="max-width:620px;margin:0 auto;padding:28px 16px"><div style="background:#17382f;padding:24px 28px;text-align:center">${logo}</div><main style="background:#fff;padding:36px 30px;border:1px solid #e5dcd1;border-top:0"><div style="color:#9d542f;font:700 11px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase">SHAM'S CHAI</div>${content}</main><footer style="padding:22px 8px;text-align:center;color:#65675f;font:12px Arial,sans-serif">A thoughtful cup, made for your everyday ritual.<br><a href="${frontendUrl()}" style="color:#17382f">Visit Sham's Chai</a></footer></div></body></html>`;
}

const button = (label: string, url: string) => `<a href="${escapeHtml(url)}" style="display:inline-block;background:#17382f;color:#fff;padding:14px 22px;text-decoration:none;font:700 12px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(label)}</a>`;
const heading = (title: string, intro: string) => `<h1 style="font-size:32px;line-height:1.1;margin:12px 0;color:#17382f">${escapeHtml(title)}</h1><p style="font:16px/1.7 Arial,sans-serif;color:#4a4b45">${escapeHtml(intro)}</p>`;

export const emailTemplates = {
  verifyAccount(name: string, token: string) {
    const url = `${frontendUrl()}/verify-email?token=${encodeURIComponent(token)}`;
    return { subject: 'Confirm your Sham\'s Chai email', html: layout('Confirm your email', `${heading(`Welcome, ${name}.`, 'Your Sham\'s Chai account is ready. Confirm your email to keep your account secure.') }<p style="margin:28px 0">${button('Verify email address', url)}</p><p style="font:12px/1.6 Arial,sans-serif;color:#65675f">This link expires in 24 hours. If you did not create this account, you can ignore this email.</p>`) };
  },
  welcomeVerified(name: string) {
    return { subject: 'Welcome to Sham\'s Chai', html: layout('Welcome to Sham\'s Chai', `${heading(`You're in, ${name}.`, 'Your account is verified and your next proper cup is closer than ever.')}${button('Explore the collection', `${frontendUrl()}/the-collection`)}`) };
  },
  waitlist(email: string, recipeName: string) {
    return { subject: `${recipeName} is brewing`, html: layout('You are on the list', `${heading('A new recipe is brewing.', `Thanks for joining the ${recipeName} waitlist. We will write when there is something worth opening your inbox for.`)}${button('Visit Sham\'s Chai', `${frontendUrl()}/the-collection`)}`) };
  },
  orderConfirmed(name: string, order: { orderNumber: string; totalAmount: unknown; items: { title: string; size: string; quantity: number }[] }) {
    const rows = order.items.map(item => `<tr><td style="padding:10px 0;border-bottom:1px solid #e5dcd1">${escapeHtml(item.title)}<br><small style="color:#65675f">${escapeHtml(item.size)} x ${item.quantity}</small></td></tr>`).join('');
    return { subject: `Order ${order.orderNumber} is confirmed`, html: layout('Your chai is on its way', `${heading(`Thank you, ${name}.`, `Order ${order.orderNumber} has been confirmed and we are preparing your parcel.`)}<table style="width:100%;font:14px Arial,sans-serif;color:#4a4b45">${rows}<tr><td style="padding-top:16px;font-weight:bold">Total: INR ${escapeHtml(order.totalAmount)}</td></tr></table><p style="margin-top:28px">${button('Track your order', `${frontendUrl()}/order-confirmation/${encodeURIComponent(order.orderNumber)}`)}</p>`) };
  },
  orderStatus(name: string, orderNumber: string, status: string) {
    return { subject: `Order ${orderNumber}: ${status.toLowerCase()}`, html: layout('A note about your order', `${heading(`Your order is ${status.toLowerCase()}.`, `Hi ${name}, order ${orderNumber} has moved to the ${status.toLowerCase()} stage.`)}${button('View order', `${frontendUrl()}/order-confirmation/${encodeURIComponent(orderNumber)}`)}`) };
  },
  internal(subject: string, lines: string[]) {
    return { subject: `[Sham's Chai] ${subject}`, html: layout(subject, `<h1 style="font-size:28px;color:#17382f">${escapeHtml(subject)}</h1>${lines.map(line => `<p style="font:14px/1.6 Arial,sans-serif;color:#4a4b45">${escapeHtml(line)}</p>`).join('')}`) };
  },
};

class MailService {
  private transporter?: Transporter;

  private getLogoAttachment() {
    if (!existsSync(logoPath)) return undefined;
    return { name: 'chai-mark.svg', content: readFileSync(logoPath).toString('base64'), contentId: 'shams-chai-logo' };
  }

  private getTransporter() {
    if (this.transporter) return this.transporter;
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) return null;
    this.transporter = nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user, pass } });
    return this.transporter;
  }

  async send(to: string, message: { subject: string; html: string }) {
    if (!to) return false;
    const brevoKey = process.env.BREVO_API_KEY;
    if (brevoKey) {
      const logo = this.getLogoAttachment();
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { accept: 'application/json', 'api-key': brevoKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: { email: process.env.BREVO_SENDER_EMAIL || process.env.MAIL_FROM || '', name: process.env.BREVO_SENDER_NAME || "Sham's Chai" },
          to: [{ email: to }],
          subject: message.subject,
          htmlContent: message.html,
          ...(logo ? { attachment: [logo] } : {}),
        }),
      });
      if (!response.ok) throw new Error(`Brevo email failed with HTTP ${response.status}: ${await response.text()}`);
      return true;
    }
    const transporter = this.getTransporter();
    if (!transporter) {
      console.warn(`Email skipped for ${to}: configure SMTP_HOST, SMTP_USER and SMTP_PASS.`);
      return false;
    }
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject: message.subject,
      html: message.html,
      ...(existsSync(logoPath) ? { attachments: [{ filename: 'chai-mark.svg', path: logoPath, cid: 'shams-chai-logo' }] } : {}),
    });
    return true;
  }

  async sendCustomerAndTeam(to: string, customerMessage: { subject: string; html: string }, internalMessage: { subject: string; html: string }) {
    await Promise.allSettled([this.send(to, customerMessage), this.send(process.env.EMAIL_NOTIFY_TO || process.env.MAIL_FROM || '', internalMessage)]);
  }
}

export const mailService = new MailService();
