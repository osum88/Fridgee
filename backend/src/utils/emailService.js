import nodemailer from "nodemailer"
import { emailVerificationTexts, passwordResetTexts, passwordResetSuccessTexts } from "./emailTexts.js";

//transportni udaje
const transportOptions = {
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
};

if (process.env.NODE_ENV !== "production") {
  transportOptions.tls = { rejectUnauthorized: false };
}

const transporter = nodemailer.createTransport(transportOptions);

//odelani emailu verification email
export const sendVerificationEmail = async (userEmail, verificationLink, language = "en") => {
    const texts = emailVerificationTexts[language];

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: texts.subject,
        html: texts.body(verificationLink),
    };
    try{
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to: ${userEmail}`);
    } catch (error) {
        console.error(`Error sending verification email to ${userEmail}:`, error);
        throw new Error("Failed to send verification email.");
    }
};

//odelani emailu password reset email
export const sendPasswordResetEmail = async (userEmail, resetLink, language = "en") => {
    const texts = passwordResetTexts[language];

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: texts.subject,
        html: texts.body(resetLink),
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to: ${userEmail}`);
    } catch (error) {
        console.error(`Error sending password reset email to ${userEmail}:`, error);
        throw new Error("Failed to send password reset email.");
    }
};

//odelani emailu password reset success email
export const sendPasswordResetSuccessEmail  = async (userEmail, language = "en") => {
    const texts = passwordResetSuccessTexts[language];

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
         subject: texts.subject,
        html: texts.body(),
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset success email sent to: ${userEmail}`); 
    } catch (error) {
        console.error(`Error sending password reset success email to ${userEmail}:`, error); 
        throw new Error("Failed to send password reset success confirmation email."); 
    }
};