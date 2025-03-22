import { beforeEach, describe, expect, it } from "bun:test";
import { type IWalletData, Wallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletBalance } from "@/modules/wallet/src/domain/classes/walletBalance";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("Wallet", () => {
	let mockData: IWalletData;

	beforeEach(() => {
		mockData = {
			id: new SnowflakeID(),
			userId: new SnowflakeID(),
			user: null,
			balance: WalletBalance.create(
				faker.number.float({ min: WalletBalance.MINIMUM_BALANCE_AMOUNT, max: 1000 }),
			).getValue(),
			isDeleted: false,
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	});

	describe("create wallet", () => {
		it("should create a Wallet", () => {
			const wallet = Wallet.create(mockData);

			expect(wallet).toBeInstanceOf(Wallet);
			expect(wallet.id).toBe(mockData.id);
			expect(wallet.userId).toBe(mockData.userId);
			expect(wallet.user).toBe(mockData.user);
			expect(wallet.balance).toBe(mockData.balance);
			expect(wallet.isDeleted).toBe(mockData.isDeleted);
			expect(wallet.createdAt.toString()).toBe(mockData.createdAt.toString());
			expect(wallet.updatedAt.toString()).toBe(mockData.updatedAt.toString());
		});
	});

	describe("reduceBalance", () => {
		it("should reduce the balance", () => {
			const wallet = Wallet.create(mockData);
			const walletBalance = wallet.balanceValue;
			const amountToReduce = 30;

			wallet.reduceBalance(amountToReduce);

			expect(wallet.balanceValue).toBe(walletBalance - amountToReduce);
		});

		it("should throw an error if the balance is not enough", () => {
			const wallet = Wallet.create(mockData);
			const walletBalance = wallet.balanceValue;
			const amountToReduce = walletBalance + 10;

			const balance = WalletBalance.create(walletBalance);

			expect(() => wallet.reduceBalance(amountToReduce)).toThrowError(
				"Invalid balance amount. Balance must be greater than or equal to 0.",
			);
		});
	});

	describe("addBalance", () => {
		it("should add balance", () => {
			const wallet = Wallet.create(mockData);
			const walletBalance = wallet.balanceValue;
			const amountToAdd = 50;

			wallet.addBalance(amountToAdd);

			expect(wallet.balanceValue).toBe(walletBalance + amountToAdd);
		});

		it("should throw an error if the amount to be added is invalid", () => {
			const wallet = Wallet.create(mockData);
			const invalidAmount = -wallet.balanceValue + -1;

			expect(() => wallet.addBalance(invalidAmount)).toThrowError(
				"Invalid balance amount. Balance must be greater than or equal to 0.",
			);
		});
	});

	describe("setBalance", () => {
		it("should set balance", () => {
			const wallet = Wallet.create({
				...mockData,
				balance: WalletBalance.create(100).getValue(),
			});

			wallet.setBalance(300);

			expect(wallet.balanceValue).toBe(300);
		});

		it("should throw an error if the set balance is negative number", () => {
			const wallet = Wallet.create(mockData);

			expect(() => wallet.setBalance(-1)).toThrowError(
				"Invalid balance amount. Balance must be greater than or equal to 0.",
			);
		});
	});
});
