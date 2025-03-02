import { smtpClient } from "@/shared/infrastructure/smtp";
import { verifyEmailTemplate } from "@/shared/infrastructure/smtp/template/verifyEmail";

export const sendVerificationEmail = (email: string, code: string) => {
	smtpClient.sendMail({
		from: `noreply <${process.env.SMTP_EMAIL}>`,
		to: email,
		subject: "NEU Wallet Email Confirmation",
		html: verifyEmailTemplate(code),
	});
};
