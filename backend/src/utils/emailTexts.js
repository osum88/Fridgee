export const emailVerificationTexts = {
    "en": {
        subject: "Verify your email for Fridgee",
        body: (verificationLink) => `
            <p>Hello,</p>
            <p>Thank you for registering with Fridgee. To complete your registration, please verify your email by clicking the link below:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p>This link will expire in 24 hours. If you did not register, please ignore this email.</p>
        `
    },
    "cs": {
        subject: "Ověřte svůj e-mail pro Fridgee",
        body: (verificationLink) => `
            <p>Dobrý den,</p>
            <p>Děkujeme vám za registraci ve službě Fridgee. Pro dokončení registrace ověřte prosím svůj e-mail kliknutím na níže uvedený odkaz:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p>Tento odkaz vyprší za 6 hodin. Pokud jste se neregistroval(a), tento e-mail prosím ignorujte.</p>
        `
    }
};

export const passwordResetTexts = {
    "en": {
        subject: "Password Reset Request for Your Fridgee Account",
        body: (resetLink) => `
            <p>Hello,</p>
            <p>We received a request to reset the password for your account. If you did not request this, you can safely ignore this email.</p>
            <p>To reset your password, click the following link:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
        `
    },
    "cs": {
        subject: "Požadavek na změnu vašeho hesla v aplikace Fridgee",
        body: (resetLink) => `
            <p>Dobrý den,</p>
            <p>Obdrželi jsme požadavek na změnu hesla pro váš účet. Pokud jste o to nežádal(a), můžete tuto zprávu ignorovat.</p>
            <p>Pro resetování hesla klikněte na následující odkaz:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
        `
    }
};

export const passwordResetSuccessTexts = {
    "en": {
        subject: "Your password has been reset successfully Fridgee",
        body: () => `
            <p>Hello,</p>
            <p>Your password for your Fridgee account has been successfully changed.</p>
            <p>If you did not make this password change, please contact support.</p>
        `
    },
    "cs": {
        subject: "Vaše heslo bylo úspěšně změněno ve službě Fridgee",
        body: () => `
            <p>Dobrý den,</p>
            <p>Vaše heslo k vašemu účtu ve službě Fridgee bylo úspěšně změněno.</p>
            <p>Pokud jste neprovedl změnu hesla, kontaktujte prosím podporu.</p>
        `
    }
};