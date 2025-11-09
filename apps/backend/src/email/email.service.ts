import { Injectable, Logger } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly api: SibApiV3Sdk.TransactionalEmailsApi;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly appUrl: string;
  private readonly isConfigured: boolean;

  constructor() {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = process.env.BREVO_API_KEY || '';
    this.isConfigured = !!process.env.BREVO_API_KEY;

    this.api = new SibApiV3Sdk.TransactionalEmailsApi();
    const from = process.env.EMAIL_FROM || 'Darigo <noreply@localhost.local>';
    const match = from.match(/^(.*)\s*<([^>]+)>$/);
    this.senderName = match ? match[1].trim() : 'Darigo';
    this.senderEmail = match ? match[2].trim() : from;
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';

    this.logger.log(
      `EmailService initialized: sender="${this.senderName} <${this.senderEmail}>", appUrl=${this.appUrl}, brevoConfigured=${this.isConfigured}`
    );
  }

  async sendWelcomeEmail(toEmail: string, firstName?: string) {
    const subject = 'Bienvenue chez Darigo';
    const greetingName = firstName?.trim() || '';
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
        <h2>Bienvenue${greetingName ? `, ${greetingName}` : ''} 👋</h2>
        <p>Nous sommes ravis de vous compter parmi nous.</p>
        <p>Commencez dès maintenant en visitant votre espace :</p>
        <p><a href="${this.appUrl}" style="background:#16a34a;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block">Accéder à Darigo</a></p>
        <p>À très vite,</p>
        <p>L'équipe Darigo</p>
      </div>
    `;
    await this.sendEmail(toEmail, subject, html);
  }

  async sendVerificationEmail(toEmail: string, token: string) {
    const url = `${this.appUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
    const subject = 'Vérifiez votre e‑mail';
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
        <h2>Bienvenue chez Darigo</h2>
        <p>Merci de votre inscription. Pour terminer, veuillez vérifier votre e‑mail.</p>
        <p><a href="${url}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block">Vérifier mon e‑mail</a></p>
        <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
        <p><a href="${url}">${url}</a></p>
        <p>Ce lien expire dans 24h.</p>
      </div>
    `;
    await this.sendEmail(toEmail, subject, html);
  }

  async sendPasswordResetEmail(toEmail: string, token: string) {
    const url = `${this.appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'Réinitialisation du mot de passe';
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Vous avez demandé de réinitialiser votre mot de passe.</p>
        <p><a href="${url}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block">Réinitialiser mon mot de passe</a></p>
        <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
        <p><a href="${url}">${url}</a></p>
        <p>Ce lien expire dans 1h.</p>
      </div>
    `;
    await this.sendEmail(toEmail, subject, html);
  }

  async sendRequestCreatedEmail(toEmail: string, requestId: string) {
    const url = `${this.appUrl}/requests/${encodeURIComponent(requestId)}`;
    const subject = 'Confirmation de votre demande';
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
        <h2>Votre demande a été créée ✅</h2>
        <p>Merci d'avoir soumis une demande sur Darigo. Notre équipe et les prestataires disponibles vont l'examiner.</p>
        <p>Vous pouvez consulter les détails de votre demande ici :</p>
        <p><a href="${url}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block">Voir ma demande</a></p>
        <p>Identifiant de la demande : <strong>${requestId}</strong></p>
        <p>À tout moment, vous pouvez suivre l'évolution depuis votre espace.</p>
        <p>Merci,</p>
        <p>L'équipe Darigo</p>
      </div>
    `;
    await this.sendEmail(toEmail, subject, html);
  }

  async sendRequestExpiredEmail(toEmail: string, requestId: string) {
    const url = `${this.appUrl}/requests/${encodeURIComponent(requestId)}`;
    const subject = 'Votre demande a expiré';
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
        <h2>Votre demande a expiré ⏳</h2>
        <p>La date prévue de service est dépassée et la demande n'a pas été acceptée ni complétée.</p>
        <p>Vous pouvez créer une nouvelle demande ou ajuster vos informations si nécessaire.</p>
        <p><a href="${url}" style="background:#6b7280;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block">Voir la demande</a></p>
        <p>Identifiant de la demande : <strong>${requestId}</strong></p>
        <p>Merci,</p>
        <p>L'équipe Darigo</p>
      </div>
    `;
    await this.sendEmail(toEmail, subject, html);
  }

  async sendRequestExpiringSoonEmail(toEmail: string, requestId: string) {
    const url = `${this.appUrl}/requests/${encodeURIComponent(requestId)}`;
    const subject = 'Votre demande expire dans 1 heure';
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
        <h2>Votre demande arrive à échéance ⏰</h2>
        <p>La date de service prévue est atteinte. Sans acceptation ou finalisation, la demande sera automatiquement clôturée dans une heure.</p>
        <p>Vous pouvez mettre à jour la demande ou en créer une nouvelle si nécessaire.</p>
        <p><a href="${url}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block">Voir la demande</a></p>
        <p>Identifiant de la demande : <strong>${requestId}</strong></p>
        <p>Merci,</p>
        <p>L'équipe Darigo</p>
      </div>
    `;
    await this.sendEmail(toEmail, subject, html);
  }

  async sendRequestNewApplicationEmail(toEmail: string, requestId: string, providerName?: string) {
    const url = `${this.appUrl}/requests/${encodeURIComponent(requestId)}`;
    const subject = 'Nouveau prestataire a postulé à votre demande';
    const providerText = providerName ? `Le prestataire <strong>${providerName}</strong> a postulé.` : `Un prestataire a postulé.`;
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
        <h2>Nouvelle candidature reçue 📬</h2>
        <p>${providerText}</p>
        <p>Consultez les candidatures et sélectionnez le prestataire qui vous convient :</p>
        <p><a href="${url}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block">Voir ma demande</a></p>
        <p>Identifiant de la demande : <strong>${requestId}</strong></p>
        <p>Merci,</p>
        <p>L'équipe Darigo</p>
      </div>
    `;
    await this.sendEmail(toEmail, subject, html);
  }

  async sendProviderApplicationReceivedEmail(toEmail: string, applicationId: string) {
    const url = `${this.appUrl}/get-started`;
    const subject = 'Votre candidature prestataire a été reçue';
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
        <h2>Merci pour votre candidature 🙌</h2>
        <p>Nous avons bien reçu votre candidature pour devenir prestataire sur Darigo.</p>
        <p>Notre équipe va l'examiner et vous informer dès qu'une décision sera prise.</p>
        <p>Identifiant de candidature : <strong>${applicationId}</strong></p>
        <p>Vous pouvez consulter votre espace et compléter votre profil si nécessaire :</p>
        <p><a href="${url}" style="background:#16a34a;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;display:inline-block">Aller à mon espace</a></p>
        <p>Merci,</p>
        <p>L'équipe Darigo</p>
      </div>
    `;
    await this.sendEmail(toEmail, subject, html);
  }

  private async sendEmail(toEmail: string, subject: string, html: string) {
    try {
      if (!this.isConfigured) {
        this.logger.warn('Brevo not configured (missing BREVO_API_KEY); skipping email send');
        return;
      }
      const payload: SibApiV3Sdk.SendSmtpEmail = {
        sender: { email: this.senderEmail, name: this.senderName },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html,
      } as any;
      const res = await this.api.sendTransacEmail(payload);
      this.logger.log(`Email sent to ${toEmail}: subject="${subject}" id=${(res as any)?.messageId || 'n/a'}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${toEmail}: ${error?.message || error}`);
      throw error;
    }
  }
}