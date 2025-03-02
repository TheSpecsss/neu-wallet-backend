export const generateVerificationCode = () => {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

	return Array.from(
		{ length: 6 },
		() => alphabet[Math.floor(Math.random() * alphabet.length)],
	).join("");
};
