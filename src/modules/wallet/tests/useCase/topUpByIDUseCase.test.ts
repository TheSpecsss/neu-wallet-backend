import { beforeEach, describe, expect, it } from "bun:test";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { MINIMUM_TOPUP_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import { TopUpByIDUseCase } from "@/modules/wallet/src/useCase/topUpByIDUseCase";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { Decimal } from "@/shared/domain/decimal";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

describe("TopUpByIdUseCase", () => {
	let useCase: TopUpByIDUseCase;

	beforeEach(async () => {
		useCase = new TopUpByIDUseCase();
	});

	it("should increase the receiver's wallet balance by the top-up amount", async () => {
		const seededTopUpCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const seededReceiver = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededReceiverWallet = await seedWallet({
			userId: seededReceiver.id,
			balance: new Decimal(500),
		});

		const wallet = await useCase.execute({
			receiverId: seededReceiver.id,
			topUpCashierId: seededTopUpCashier.id,
			amount: 100,
		});

		expect(wallet.idValue).toBe(seededReceiverWallet.id);
		expect(wallet.balanceValue).toBe(600);
	});

	it("should throw an error when the top-up amount is less than the minimum top-up amount", async () => {
		const seededTopUpCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const seededReceiver = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededReceiver.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				receiverId: seededReceiver.id,
				topUpCashierId: seededTopUpCashier.id,
				amount: MINIMUM_TOPUP_AMOUNT - 1,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			`The amount to be topped up must be at least ${MINIMUM_TOPUP_AMOUNT}`,
		);
	});

	it("should throw an error when the receiver does not exist", async () => {
		const seededTopUpCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const seededReceiver = new SnowflakeID().toString();

		let errorMessage = "";
		try {
			await useCase.execute({
				receiverId: seededReceiver,
				topUpCashierId: seededTopUpCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`Receiver ${seededReceiver} does not exist`);
	});

	it("should throw an error when the top-up cashier does not exist", async () => {
		const seededTopUpCashier = new SnowflakeID().toString();
		const seededReceiver = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededReceiver.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				receiverId: seededReceiver.id,
				topUpCashierId: seededTopUpCashier,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededTopUpCashier} does not exist`);
	});

	it("should throw an error when the said cashier does not have Top Up permission", async () => {
		const seededTopUpCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededReceiver = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededReceiver.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				receiverId: seededReceiver.id,
				topUpCashierId: seededTopUpCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			`User ${seededTopUpCashier.id} does not have the required permission`,
		);
	});
});
