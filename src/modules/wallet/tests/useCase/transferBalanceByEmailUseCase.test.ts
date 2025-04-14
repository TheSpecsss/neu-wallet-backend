import { beforeAll, describe, expect, it } from "bun:test";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { MINIMUM_TRANSFER_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import {
	type IWalletRepository,
	WalletRepository,
} from "@/modules/wallet/src/repositories/walletRepository";
import { TransferBalanceByEmailUseCase } from "@/modules/wallet/src/useCase/transferBalanceByEmailUseCase";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { Decimal } from "@/shared/domain/decimal";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("TransferBalanceByEmailUseCase", () => {
	let useCase: TransferBalanceByEmailUseCase;
	let walletRepository: IWalletRepository;

	beforeAll(async () => {
		useCase = new TransferBalanceByEmailUseCase();
		walletRepository = new WalletRepository();
	});

	it("should transfer sender wallet balance into receiver wallet balance", async () => {
		const seededReceiver = await seedUser();
		const seededSender = await seedUser();

		const seededSenderWallet = await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});
		const seededReceiverWallet = await seedWallet({
			userId: seededReceiver.id,
			balance: new Decimal(0),
		});

		const { senderWallet, receiverWallet } = await useCase.execute({
			senderId: seededSender.id,
			receiverEmail: seededReceiver.email,
			amount: 500,
		});

		expect(senderWallet.idValue).toBe(seededSenderWallet.id);
		expect(senderWallet.balanceValue).toBe(0);
		expect(receiverWallet.idValue).toBe(seededReceiverWallet.id);
		expect(receiverWallet.balanceValue).toBe(500);

		const updatedSenderWallet = await walletRepository.findWalletById(seededSenderWallet.id);
		expect(updatedSenderWallet?.balanceValue).toBe(0);

		const updatedReceiverWallet = await walletRepository.findWalletById(seededReceiverWallet.id);
		expect(updatedReceiverWallet?.balanceValue).toBe(500);
	});

	it("should throw an error when amount is less than minimum transfer amount", async () => {
		const seededReceiver = await seedUser();
		const seededSender = await seedUser();

		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});
		await seedWallet({
			userId: seededReceiver.id,
			balance: new Decimal(0),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				receiverEmail: seededReceiver.email,
				amount: MINIMUM_TRANSFER_AMOUNT - 1,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`The transfer amount must be at least ${MINIMUM_TRANSFER_AMOUNT}`);
	});

	it("should throw an error when sender is sending to itself", async () => {
		const seededSender = await seedUser();
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				receiverEmail: seededSender.email,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("You cannot send to yourself");
	});

	it("should throw an error when sender does not exist", async () => {
		const seededReceiver = await seedUser();
		const senderId = new SnowflakeID().toString();

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId,
				receiverEmail: seededReceiver.email,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${senderId} does not exist`);
	});

	it("should throw an error when receiver does not exist", async () => {
		const receiverEmail = faker.internet.email({ provider: "neu.edu.ph" });
		const seededSender = await seedUser();

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				receiverEmail,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${receiverEmail} does not exist`);
	});

	it("should throw an error when sender wallet does not exist", async () => {
		const seededReceiver = await seedUser();
		const seededSender = await seedUser();

		await seedWallet({
			userId: seededReceiver.id,
			balance: new Decimal(0),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				receiverEmail: seededReceiver.email,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededSender.id} wallet does not exist`);
	});

	it("should throw an error when receiver wallet does not exist", async () => {
		const seededReceiver = await seedUser();
		const seededSender = await seedUser();

		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(0),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				receiverEmail: seededReceiver.email,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededReceiver.email} wallet does not exist`);
	});

	it("should throw an error when sender does not have enough balance", async () => {
		const seededReceiver = await seedUser();
		const seededSender = await seedUser();

		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});
		await seedWallet({
			userId: seededReceiver.id,
			balance: new Decimal(0),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				receiverEmail: seededReceiver.email,
				amount: 1000,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededSender.id} does not have sufficient balance`);
	});
});
