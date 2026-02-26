const emailStyles = {
  container:
    "font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;",
  header:
    "color: #1d9bc5; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;",
  button:
    "display: inline-block; padding: 12px 24px; background-color: #1d9bc5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;",
  footer:
    "font-size: 12px; color: #888; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;",
};

export const emailVerificationTexts = {
  en: {
    subject: "Verify your email for Fridgee",
    body: (verificationLink) => `
        <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">Fridgee</div>
            <p>Hello,</p>
            <p>Thank you for registering with Fridgee. To complete your registration, please verify your email by clicking the button below:</p>
            <div style="text-align: center;">
                <a href="${verificationLink}" style="${emailStyles.button}">Verify Account</a>
            </div>
            <p>This link will expire in 24 hours. If you did not register, please ignore this email.</p>
            <div style="${emailStyles.footer}">© 2026 Fridgee App. All rights reserved.</div>
        </div>`,
  },
  cs: {
    subject: "Ověřte svůj e-mail pro Fridgee",
    body: (verificationLink) => `
        <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">Fridgee</div>
            <p>Dobrý den,</p>
            <p>Děkujeme vám za registraci ve službě Fridgee. Pro dokončení registrace ověřte prosím svůj e-mail kliknutím na tlačítko níže:</p>
            <div style="text-align: center;">
                <a href="${verificationLink}" style="${emailStyles.button}">Ověřit účet</a>
            </div>
            <p>Tento odkaz vyprší za 6 hodin. Pokud jste se neregistroval(a), tento e-mail prosím ignorujte.</p>
            <div style="${emailStyles.footer}">© 2026 Fridgee App. Všechna práva vyhrazena.</div>
        </div>`,
  },
};

export const passwordResetTexts = {
  en: {
    subject: "Password Reset Request for Your Fridgee Account",
    body: (resetLink) => `
        <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">Fridgee</div>
            <p>Hello,</p>
            <p>We received a request to reset the password for your account. If you did not request this, you can safely ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center;">
                <a href="${resetLink}" style="${emailStyles.button}">Reset Password</a>
            </div>
            <div style="${emailStyles.footer}">© 2026 Fridgee App.</div>
        </div>`,
  },
  cs: {
    subject: "Požadavek na změnu vašeho hesla v aplikace Fridgee",
    body: (resetLink) => `
        <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">Fridgee</div>
            <p>Dobrý den,</p>
            <p>Obdrželi jsme požadavek na změnu hesla pro váš účet. Pokud jste o to nežádal(a), můžete tuto zprávu ignorovat.</p>
            <p>Pro resetování hesla klikněte na tlačítko níže:</p>
            <div style="text-align: center;">
                <a href="${resetLink}" style="${emailStyles.button}">Resetovat heslo</a>
            </div>
            <div style="${emailStyles.footer}">© 2026 Fridgee App.</div>
        </div>`,
  },
};

export const passwordResetSuccessTexts = {
  en: {
    subject: "Your password has been reset successfully Fridgee",
    body: () => `
        <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">Fridgee</div>
            <p>Hello,</p>
            <p>Your password for your Fridgee account has been successfully changed.</p>
            <p>If you did not make this password change, please contact support.</p>

            <div style="${emailStyles.footer}">© 2026 Fridgee App.</div>
        </div>`,
  },
  cs: {
    subject: "Vaše heslo bylo úspěšně změněno ve službě Fridgee",
    body: () => `
        <div style="${emailStyles.container}">
            <div style="${emailStyles.header}">Fridgee</div>
            <p>Dobrý den,</p>
            <p>Vaše heslo k vašemu účtu ve službě Fridgee bylo úspěšně změněno.</p>
            <p>Pokud jste neprovedl(a) změnu hesla, kontaktujte prosím podporu.</p>
            <div style="${emailStyles.footer}">© 2026 Fridgee App.</div>
        </div>`,
  },
};
