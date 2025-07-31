import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
        tls: {
            rejectUnauthorized: false // zakaze kontrolu certifikátu, potom odstranit, ted potreba kvuli blokaci antivirem
    }
});

export const sendVerificationEmail = async (userEmail, verificationLink) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: "Verify your email for Fridgee",
        html: `
            <p>Hello,</p>
            <p>Thank you for registering with Fridgee. To complete your registration, please verify your email by clicking the link below:</p>
            <p><a href="${verificationLink}">Verify Email</a></p>
            <p>This link will expire in 24 hours. If you did not register, please ignore this email.</p>
        `,
    };
    try{
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to: ${userEmail}`);
    } catch (error) {
        console.error(`Error sending verification email to ${userEmail}:`, error);
        throw new Error("Failed to send verification email.");
    }
};

export const sendPasswordResetEmail = async (userEmail, resetLink) => {
        const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: "Password reset for Fridgee",
        html: `
            <p>Hello,</p>
            <p>We received a request to reset the password for your account. If you did not make this request, you can ignore this email.</p>
            <p>To reset your password, please click on the following link:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to: ${userEmail}`);
    } catch (error) {
        console.error(`Error sending password reset email to ${userEmail}:`, error);
        throw new Error("Failed to send password reset email.");
    }
};

export const sendPasswordResetSuccessEmail  = async (userEmail) => {
        const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: "Your password has been reset successfully - Fridgee ",
        html: `
            <p>Hello,</p>
            <p>This is a confirmation that the password for your account on Fridgee has been successfully reset.</p>
            <p>If you did not initiate this password reset, please contact our support team immediately.</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset success email sent to: ${userEmail}`); 
    } catch (error) {
        console.error(`Error sending password reset success email to ${userEmail}:`, error); 
        throw new Error("Failed to send password reset success confirmation email."); 
    }
};