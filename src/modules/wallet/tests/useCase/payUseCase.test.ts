import { beforeAll, describe, expect, it } from "bun:test";
import { type IUserService, UserService } from "@/modules/user/src";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { MINIMUM_PAY_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import { PayUseCase } from "@/modules/wallet/src/useCase/payUseCase";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { Decimal } from "@/shared/domain/decimal";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

describe("PayUseCase", () => {
	let useCase: PayUseCase;
	let userService: IUserService;

	beforeAll(async () => {
		useCase = new PayUseCase();
		userService = new UserService();
	});

	it("should remove users wallet balance by the amount", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededSenderWallet = await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		const wallet = await useCase.execute({
			senderId: seededSender.id,
			cashierId: seededCashier.id,
			amount: 500,
		});
		expect(wallet.idValue).toBe(seededSenderWallet.id);
		expect(wallet.balanceValue).toBe(0);
	});

	it("should throw an error when amount is less than minimum pay amount", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId: seededCashier.id,
				amount: MINIMUM_PAY_AMOUNT - 1,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`The amount to be sent must be at least ${MINIMUM_PAY_AMOUNT}`);
	});

	it("should throw an error when sender are sending to itself", async () => {
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId: seededSender.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("You cannot send to yourself");
	});

	it("should throw an error when sender does not exist", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const senderId = new SnowflakeID().toString();

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId,
				cashierId: seededCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`Sender ${senderId} does not exist`);
	});

	it("should throw an error when sender does not exist", async () => {
		const cashierId = new SnowflakeID().toString();
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`Cashier ${cashierId} does not exist`);
	});

	it("should throw an error when cashierId are not cashier account type", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId: seededCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededCashier.id} is not a cashier`);
	});

	it("should remove users wallet balance by the amount", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(100),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId: seededCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededSender.id} does not have enough money`);
	});
});
