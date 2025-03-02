import { createTransport } from "nodemailer";

export const smtpClient = createTransport({
	host: process.env.SMTP_HOST as string,
	port: Number(process.env.SMTP_PORT) as number,
	auth: {
		user: process.env.SMTP_USERNAME as string,
		pass: process.env.SMTP_PASSWORD as string,
	},
});
