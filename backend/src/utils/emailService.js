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
        from: "jan.sobotka.jan@seznam.cz",
        to: userEmail,
        subject: 'Verify Your Email for Fridgee',
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