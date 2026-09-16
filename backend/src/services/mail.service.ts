import nodemailer, { Transporter } from 'nodemailer';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const frontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const logoPath = path.resolve(__dirname, '../../../public/assets/shams/brand/chai-mark.png');
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character] || character));

/** Where the business reads its own mail. Every send is copied here. */
const teamInbox = () => process.env.EMAIL_NOTIFY_TO || 'shammi.journo@gmail.com';
const teamBcc = () => (process.env.EMAIL_BCC || 'krishnachaitu1298@gmail.com')
  .split(',').map(address => address.trim()).filter(Boolean);

export function createEmailToken() {
  const token = randomBytes(32).toString('hex');
  return { token, hash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
}

/* ------------------------------------------------------------------ *
 * Templates. Email clients ignore most modern CSS, so the layout is
 * tables with inline styles only — no flexbox, grid or stylesheets.
 * ------------------------------------------------------------------ */

const INK = '#121110';
const CREAM = '#F2EEE9';
const COFFEE = '#B48A68';
const BODY = '#4A4B45';
const LINE = '#E3DAD0';
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

function layout(preheader: string, content: string) {
  const logo = existsSync(logoPath)
    ? `<img src="cid:shams-chai-logo" alt="" width="46" height="46" style="display:block;margin:0 auto 12px;border:0">`
    : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>Sham's Chai</title></head>
<body style="margin:0;padding:0;background:${CREAM};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

      <tr><td style="background:${INK};padding:30px 24px;text-align:center;">
        ${logo}
        <div style="font:400 26px/1 ${SERIF};color:${CREAM};letter-spacing:.02em;font-style:italic;">Sham&rsquo;s</div>
        <div style="font:600 9px/1.6 ${SANS};color:${COFFEE};letter-spacing:.28em;text-transform:uppercase;margin-top:8px;">It&rsquo;s a modern woman&rsquo;s recipe</div>
      </td></tr>

      <tr><td style="background:#FFFFFF;border:1px solid ${LINE};border-top:0;padding:38px 32px;">
        ${content}
      </td></tr>

      <tr><td style="padding:22px 16px;text-align:center;font:400 12px/1.7 ${SANS};color:#7A7B74;">
        Sham&rsquo;s MC Traders Private Limited &middot; Hyderabad<br>
        <a href="${frontendUrl()}" style="color:${INK};text-decoration:underline;">shamschai.com</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:hello@shamschai.com" style="color:${INK};text-decoration:underline;">hello@shamschai.com</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

const heading = (title: string) =>
  `<h1 style="margin:0 0 14px;font:400 30px/1.15 ${SERIF};color:${INK};letter-spacing:-.01em;">${escapeHtml(title)}</h1>`;

const paragraph = (text: string) =>
  `<p style="margin:0 0 16px;font:400 15px/1.75 ${SANS};color:${BODY};">${escapeHtml(text)}</p>`;

/** Bulletproof-ish button: a padded table cell, not a styled anchor. */
const button = (label: string, url: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0;">
     <tr><td style="background:${INK};">
       <a href="${escapeHtml(url)}" style="display:inline-block;padding:15px 30px;font:600 12px/1 ${SANS};letter-spacing:.1em;text-transform:uppercase;color:${CREAM};text-decoration:none;">${escapeHtml(label)}</a>
     </td></tr>
   </table>`;

const note = (text: string) =>
  `<p style="margin:22px 0 0;padding-top:18px;border-top:1px solid ${LINE};font:400 12px/1.7 ${SANS};color:#8A8B84;">${escapeHtml(text)}</p>`;

const eyebrow = (text: string) =>
  `<div style="font:600 10px/1.6 ${SANS};color:${COFFEE};letter-spacing:.22em;text-transform:uppercase;margin-bottom:10px;">${escapeHtml(text)}</div>`;

export const emailTemplates = {
  verifyAccount(name: string, token: string) {
    const url = `${frontendUrl()}/verify-email?token=${encodeURIComponent(token)}`;
    return {
      subject: 'Confirm your email · Sham’s Chai',
      html: layout('Confirm your email address to finish setting up your account.',
        `${eyebrow('Account created')}
         ${heading(`Welcome, ${name}.`)}
         ${paragraph('Your Sham’s Chai account is ready. Confirm your email address so we can keep it secure and send you order updates.')}
         ${button('Verify my email', url)}
         ${note('This link expires in 24 hours. If you did not create this account, you can safely ignore this email.')}`),
    };
  },

  welcomeVerified(name: string) {
    return {
      subject: 'You’re in · Sham’s Chai',
      html: layout('Your account is verified.',
        `${eyebrow('Email confirmed')}
         ${heading(`You’re in, ${name}.`)}
         ${paragraph('Your account is verified. Aromatic black tea leaves blended with handpicked spices — your next proper cup is a click away.')}
         ${button('Shop the pack', `${frontendUrl()}/the-collection`)}`),
    };
  },

  waitlist(_email: string, recipeName: string) {
    return {
      subject: `${recipeName} is brewing · Sham’s Chai`,
      html: layout('You are on the list.',
        `${eyebrow('Waitlist confirmed')}
         ${heading('A new recipe is brewing.')}
         ${paragraph(`Thanks for joining the ${recipeName} waitlist. We will only write when there is something worth opening your inbox for.`)}
         ${button('Visit the collection', `${frontendUrl()}/the-collection`)}`),
    };
  },

  orderConfirmed(name: string, order: { orderNumber: string; totalAmount: unknown; items: { title: string; size: string; quantity: number }[] }) {
    const rows = order.items.map(item =>
      `<tr>
         <td style="padding:14px 0;border-bottom:1px solid ${LINE};font:400 15px/1.5 ${SANS};color:${INK};">
           ${escapeHtml(item.title)}
           <div style="font:400 12px/1.6 ${SANS};color:#8A8B84;margin-top:3px;">${escapeHtml(item.size)}</div>
         </td>
         <td align="right" style="padding:14px 0;border-bottom:1px solid ${LINE};font:400 15px/1.5 ${SANS};color:${BODY};white-space:nowrap;">&times; ${item.quantity}</td>
       </tr>`).join('');
    return {
      subject: `Order ${order.orderNumber} confirmed · Sham’s Chai`,
      html: layout(`Order ${order.orderNumber} is confirmed.`,
        `${eyebrow(`Order ${order.orderNumber}`)}
         ${heading(`Thank you, ${name}.`)}
         ${paragraph('Your payment came through and we are packing your parcel now. You will hear from us again when it ships.')}
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;">
           ${rows}
           <tr>
             <td style="padding:16px 0;font:600 13px/1.5 ${SANS};color:${INK};letter-spacing:.06em;text-transform:uppercase;">Total paid</td>
             <td align="right" style="padding:16px 0;font:400 20px/1.2 ${SERIF};color:${INK};">&#8377;${escapeHtml(order.totalAmount)}</td>
           </tr>
         </table>
         ${button('Track your order', `${frontendUrl()}/order-confirmation/${encodeURIComponent(order.orderNumber)}`)}`),
    };
  },

  orderStatus(name: string, orderNumber: string, status: string) {
    const readable = status.toLowerCase();
    return {
      subject: `Order ${orderNumber} is ${readable} · Sham’s Chai`,
      html: layout(`Order ${orderNumber} is now ${readable}.`,
        `${eyebrow(`Order ${orderNumber}`)}
         ${heading(`Your order is ${readable}.`)}
         ${paragraph(`Hi ${name}, order ${orderNumber} has moved to the ${readable} stage.`)}
         ${button('View order', `${frontendUrl()}/order-confirmation/${encodeURIComponent(orderNumber)}`)}`),
    };
  },

  internal(subject: string, lines: string[]) {
    const rows = lines.map(line =>
      `<tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};font:400 14px/1.6 ${SANS};color:${BODY};">${escapeHtml(line)}</td></tr>`).join('');
    return {
      subject: `[Sham’s Chai] ${subject}`,
      html: layout(subject,
        `${eyebrow('Internal notification')}
         ${heading(subject)}
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">${rows}</table>`),
    };
  },
};

/* ------------------------------------------------------------------ */

type Message = { subject: string; html: string };

class MailService {
  private transporter?: Transporter;

  private getLogoAttachment() {
    if (!existsSync(logoPath)) return undefined;
    return { name: 'chai-mark.png', content: readFileSync(logoPath).toString('base64'), contentId: 'shams-chai-logo' };
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

  /**
   * Sends one message. `bcc` defaults to the team addresses so the business
   * keeps a copy of every mail the app sends, including customer mail.
   */
  async send(to: string, message: Message, options: { bcc?: string[] } = {}) {
    if (!to) return false;
    const bcc = (options.bcc ?? teamBcc()).filter(address => address && address !== to);
    const brevoKey = process.env.BREVO_API_KEY;

    if (brevoKey) {
      const sender = process.env.BREVO_SENDER_EMAIL || process.env.MAIL_FROM || '';
      const logo = this.getLogoAttachment();
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { accept: 'application/json', 'api-key': brevoKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: { email: sender, name: process.env.BREVO_SENDER_NAME || "Sham's Chai" },
          to: [{ email: to }],
          ...(bcc.length ? { bcc: bcc.map(email => ({ email })) } : {}),
          subject: message.subject,
          htmlContent: message.html,
          ...(logo ? { attachment: [logo] } : {}),
        }),
      });
      if (!response.ok) {
        const detail = await response.text();
        // A rejected sender is the usual cause, and it is silent otherwise.
        console.error(`Brevo rejected mail to ${to} (HTTP ${response.status}) from sender "${sender}": ${detail}`);
        throw new Error(`Brevo email failed with HTTP ${response.status}: ${detail}`);
      }
      return true;
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      console.warn(`Email skipped for ${to}: set BREVO_API_KEY, or SMTP_HOST, SMTP_USER and SMTP_PASS.`);
      return false;
    }
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      ...(bcc.length ? { bcc } : {}),
      subject: message.subject,
      html: message.html,
      ...(existsSync(logoPath) ? { attachments: [{ filename: 'chai-mark.png', path: logoPath, cid: 'shams-chai-logo' }] } : {}),
    });
    return true;
  }

  /** The customer gets their copy; the team inbox gets the internal one. */
  async sendCustomerAndTeam(to: string, customerMessage: Message, internalMessage: Message) {
    const results = await Promise.allSettled([
      this.send(to, customerMessage),
      this.send(teamInbox(), internalMessage),
    ]);
    results.forEach(result => {
      if (result.status === 'rejected') console.error('Mail delivery failed:', result.reason?.message || result.reason);
    });
  }
}

export const mailService = new MailService();
