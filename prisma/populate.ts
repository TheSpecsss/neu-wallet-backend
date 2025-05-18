import { ACTION_TYPE } from "@/modules/auditLog/src/domain/shared/constant";
import { seedAuditLog } from "@/modules/auditLog/tests/utils/seedAuditLog";
import {
	TRANSACTION_STATUS,
	TRANSACTION_TYPE,
} from "@/modules/transaction/src/domain/shared/constant";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src";
import type { IUserRawObject } from "@/modules/user/src/domain/shared/constant";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import { seedVerification } from "@/modules/verification/tests/utils/seedVerification";
import type { IWalletRawObject } from "@/modules/wallet/src/domain/shared/constant";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { Decimal } from "@/shared/domain/decimal";
import { generateVerificationCode } from "@/shared/infrastructure/authentication/generateVerificationCode";
import { saltPassword } from "@/shared/infrastructure/authentication/saltPassword";
import { db } from "@/shared/infrastructure/database";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { sleep } from "bun";

const USER_COUNT = 1000;
const TRANSACTION_COUNT = 10000;
const AUDIT_LOG_COUNT = 10000;
const START_DATE = new Date("2024-01-01T00:00:00Z");
const END_DATE = new Date();
const SLEEP_MS = 50;
const BATCH_LOG_SIZE = 100;

const randomDate = (start: Date, end: Date): Date => {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const filteredAccountTypes = Object.values(USER_ACCOUNT_TYPE).filter(
	(type) => type !== "SUPER_ADMIN",
);

const generateRandomChanges = (
	actionType: string,
): Array<{ field: string; oldValue: string; newValue: string }> => {
	switch (actionType) {
		case "USER_UPDATE": {
			const possibleFields = ["email", "accountType", "name"];
			const numberOfChanges = faker.number.int({ min: 1, max: possibleFields.length });
			const changes = [];

			for (let i = 0; i < numberOfChanges; i++) {
				const field = possibleFields[i];
				let oldValue = "";
				let newValue = "";

				switch (field) {
					case "email":
						oldValue = faker.internet.email({ provider: "neu.edu.ph" });
						newValue = faker.internet.email({ provider: "neu.edu.ph" });
						break;
					case "accountType":
						oldValue = faker.helpers.arrayElement(
							Object.values(USER_ACCOUNT_TYPE).filter((t) => t !== "SUPER_ADMIN"),
						);
						newValue = faker.helpers.arrayElement(
							Object.values(USER_ACCOUNT_TYPE).filter((t) => t !== oldValue && t !== "SUPER_ADMIN"),
						);
						break;
					case "name":
						oldValue = faker.person.fullName();
						newValue = faker.person.fullName();
						break;
				}

				changes.push({ field, oldValue, newValue });
			}

			return changes;
		}

		case "WALLET_UPDATE":
			return [
				{
					field: "balance",
					oldValue: faker.number.float({ min: 0, max: 10000 }).toString(),
					newValue: faker.number.float({ min: 0, max: 10000 }).toString(),
				},
			];

		default:
			return [];
	}
};

async function clearDatabase() {
	console.log("Clearing existing data...");
	await db.userAuditLog.deleteMany();
	await db.userTransaction.deleteMany();
	await db.userVerification.deleteMany();
	await db.userWallet.deleteMany();
	await db.user.deleteMany();
}

async function seedUsers(count: number): Promise<IUserRawObject[]> {
	console.log(`Seeding ${count} users...`);
	const users: IUserRawObject[] = [];

	for (let i = 0; i < count; i++) {
		const user = await seedUser({
			email: faker.internet.email({ provider: "neu.edu.ph" }),
			password: await saltPassword(faker.internet.password({ length: 12 })),
			name: faker.internet.username(),
			accountType: faker.helpers.arrayElement(filteredAccountTypes),
			isDeleted: false,
			isVerified: true,
			deletedAt: null,
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: new Date(),
		});

		await seedVerification({
			userId: user.id,
			code: generateVerificationCode(),
			status: VERIFICATION_STATUS.DONE,
			expiredAt: new Date(user.createdAt.getTime() + 60 * 60 * 1000),
			createdAt: user.createdAt,
			updatedAt: user.createdAt,
		});

		users.push(user);

		if ((i + 1) % BATCH_LOG_SIZE === 0) {
			console.log(`  Created ${i + 1} users...`);
		}

		await sleep(SLEEP_MS);
	}

	console.log(`✓ Seeded ${users.length} users`);
	return users;
}

async function seedWallets(users: IUserRawObject[]): Promise<IWalletRawObject[]> {
	console.log(`Seeding wallets for ${users.length} users...`);
	const wallets: IWalletRawObject[] = [];

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		const wallet = await seedWallet({
			userId: user.id,
			balance: new Decimal(faker.number.int({ min: 100, max: 1000000 })),
			isDeleted: false,
			deletedAt: null,
			createdAt: user.createdAt,
			updatedAt: user.createdAt,
		});

		wallets.push(wallet);

		if ((i + 1) % BATCH_LOG_SIZE === 0) {
			console.log(`  Created ${i + 1} wallets...`);
		}

		await sleep(SLEEP_MS);
	}

	console.log(`✓ Seeded ${wallets.length} wallets`);
	return wallets;
}

async function seedTransactions(users: IUserRawObject[], count: number): Promise<void> {
	console.log(`Seeding ${count} transactions...`);

	for (let i = 0; i < count; i++) {
		const sender = faker.helpers.arrayElement(users);
		let receiver = faker.helpers.arrayElement(users);

		while (receiver.id === sender.id) {
			receiver = faker.helpers.arrayElement(users);
		}

		const transactionDate = randomDate(START_DATE, END_DATE);

		await seedTransaction({
			senderId: sender.id,
			receiverId: receiver.id,
			amount: new Prisma.Decimal(faker.number.float({ min: 10, max: 10000 })),
			type: faker.helpers.arrayElement(Object.values(TRANSACTION_TYPE)),
			status: faker.helpers.arrayElement(Object.values(TRANSACTION_STATUS)),
			createdAt: transactionDate,
		});

		if ((i + 1) % 1000 === 0) {
			console.log(`  Created ${i + 1} transactions...`);
		}

		await sleep(SLEEP_MS);
	}

	console.log(
		`✓ Seeded ${count} transactions from ${START_DATE.toISOString().split("T")[0]} to today`,
	);
}

async function seedAuditLogs(users: IUserRawObject[], count: number): Promise<void> {
	console.log(`Seeding ${count} audit logs...`);

	for (let i = 0; i < count; i++) {
		const executor = faker.helpers.arrayElement(users);
		let target = faker.helpers.arrayElement(users);

		while (target.id === executor.id) {
			target = faker.helpers.arrayElement(users);
		}

		const actionType = faker.helpers.arrayElement(Object.values(ACTION_TYPE));

		await seedAuditLog({
			executorId: executor.id,
			targetId: target.id,
			actionType,
			changes: generateRandomChanges(actionType),
			createdAt: randomDate(START_DATE, END_DATE),
		});

		if ((i + 1) % 1000 === 0) {
			console.log(`  Created ${i + 1} audit logs...`);
		}

		await sleep(SLEEP_MS);
	}

	console.log(`✓ Seeded ${count} audit logs`);
}

async function seedDatabase() {
	console.log("📊 Starting database seeding...");

	try {
		await clearDatabase();

		const users = await seedUsers(USER_COUNT);
		await seedWallets(users);
		await seedTransactions(users, TRANSACTION_COUNT);
		await seedAuditLogs(users, AUDIT_LOG_COUNT);

		console.log("✅ Database seeding complete!");
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		throw error;
	}
}

seedDatabase()
	.catch((err) => {
		console.error("Fatal error during seeding:", err);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
