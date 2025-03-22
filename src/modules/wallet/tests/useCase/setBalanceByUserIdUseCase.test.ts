import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import {
	type IUserSchemaObject,
	USER_ACCOUNT_TYPE,
} from "@/modules/user/src/domain/shared/constant";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { WalletRepository } from "@/modules/wallet/src/repositories/walletRepository";
import { SetBalanceByUserIdUseCase } from "@/modules/wallet/src/useCase/setBalanceByUserIdUseCase";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { Decimal } from "@/shared/domain/decimal";

describe("SetBalanceByUserIdUseCase", () => {
	let useCase: SetBalanceByUserIdUseCase;
	let walletRepository: WalletRepository;
	let executor: IUserSchemaObject;

	beforeAll(async () => {
		useCase = new SetBalanceByUserIdUseCase();
		walletRepository = new WalletRepository();
	});

	describe("Executor has super admin permission", () => {
		beforeEach(async () => {
			executor = await seedUser({ accountType: USER_ACCOUNT_TYPE.SUPER_ADMIN });
		});

		it("should set user balance", async () => {
			const seededUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
			const seededWallet = await seedWallet({ userId: seededUser.id, balance: new Decimal(500) });

			await useCase.execute({
				executorId: executor.id,
				userId: seededUser.id,
				balance: 800,
			});

			const updatedWallet = await walletRepository.findWalletById(seededWallet.id);
			expect(updatedWallet!.userIdValue).toBe(seededUser.id);
			expect(updatedWallet!.balanceValue).toBe(800);
		});

		it("should throw an error when user has super admin permission", async () => {
			const seededUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.SUPER_ADMIN });
			await seedWallet({ userId: seededUser.id, balance: new Decimal(500) });

			let errorMessage = "";
			try {
				await useCase.execute({
					executorId: executor.id,
					userId: seededUser.id,
					balance: 800,
				});
			} catch (error) {
				errorMessage = (error as Error).message;
			}

			expect(errorMessage).toBe(
				`Executor ${executor.id} does not have enough permission to modify User ${seededUser.id}`,
			);
		});
	});

	describe("Executor has admin permission", () => {
		beforeEach(async () => {
			executor = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		});

		it("should set user balance", async () => {
			const seededUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
			const seededWallet = await seedWallet({ userId: seededUser.id, balance: new Decimal(500) });

			await useCase.execute({
				executorId: executor.id,
				userId: seededUser.id,
				balance: 800,
			});

			const updatedWallet = await walletRepository.findWalletById(seededWallet.id);
			expect(updatedWallet!.userIdValue).toBe(seededUser.id);
			expect(updatedWallet!.balanceValue).toBe(800);
		});

		it("should throw an error when user has super admin permission", async () => {
			const seededUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.SUPER_ADMIN });
			await seedWallet({ userId: seededUser.id, balance: new Decimal(500) });

			let errorMessage = "";
			try {
				await useCase.execute({
					executorId: executor.id,
					userId: seededUser.id,
					balance: 800,
				});
			} catch (error) {
				errorMessage = (error as Error).message;
			}

			expect(errorMessage).toBe(
				`Executor ${executor.id} does not have enough permission to modify User ${seededUser.id}`,
			);
		});

		it("should throw an error when user has admin permission", async () => {
			const seededUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
			await seedWallet({ userId: seededUser.id, balance: new Decimal(500) });

			let errorMessage = "";
			try {
				await useCase.execute({
					executorId: executor.id,
					userId: seededUser.id,
					balance: 800,
				});
			} catch (error) {
				errorMessage = (error as Error).message;
			}

			expect(errorMessage).toBe(
				`Executor ${executor.id} does not have enough permission to modify User ${seededUser.id}`,
			);
		});
	});

	describe("Executor does not have admin permission", () => {
		it("should throw an error when executor have top up cashier permission", async () => {
			executor = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });

			const seededUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
			await seedWallet({ userId: seededUser.id, balance: new Decimal(500) });

			let errorMessage = "";
			try {
				await useCase.execute({
					executorId: executor.id,
					userId: seededUser.id,
					balance: 800,
				});
			} catch (error) {
				errorMessage = (error as Error).message;
			}

			expect(errorMessage).toBe(`User ${executor.id} does not have admin permission`);
		});

		it("should throw an error when user have cashier permission", async () => {
			executor = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });

			const seededUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
			await seedWallet({ userId: seededUser.id, balance: new Decimal(500) });

			let errorMessage = "";
			try {
				await useCase.execute({
					executorId: executor.id,
					userId: seededUser.id,
					balance: 800,
				});
			} catch (error) {
				errorMessage = (error as Error).message;
			}

			expect(errorMessage).toBe(`User ${executor.id} does not have admin permission`);
		});

		it("should throw an error when user have user permission", async () => {
			executor = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

			const seededUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
			await seedWallet({ userId: seededUser.id, balance: new Decimal(500) });

			let errorMessage = "";
			try {
				await useCase.execute({
					executorId: executor.id,
					userId: seededUser.id,
					balance: 800,
				});
			} catch (error) {
				errorMessage = (error as Error).message;
			}

			expect(errorMessage).toBe(`User ${executor.id} does not have admin permission`);
		});
	});
});
