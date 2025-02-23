import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserFactory } from "@/modules/user/src/domain/factory";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { CreateUserDTO } from "@/modules/user/src/dtos/userDTO";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletFactory } from "@/modules/wallet/src/domain/factory";
import { WalletMapper } from "@/modules/wallet/src/mappers/walletMapper";
import type { Result } from "@/shared/core/result";
import { db } from "@/shared/infrastructure/database";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { defaultTo } from "rambda";

class CreateUserUnitOfWork {
	private readonly _db: typeof db;
	private readonly _userMapper: typeof UserMapper;
	private readonly _walletMapper: typeof WalletMapper;

	constructor(database = db, userMapper = UserMapper, walletMapper = WalletMapper) {
		this._db = database;
		this._userMapper = userMapper;
		this._walletMapper = walletMapper;
	}

	public async execute(user: IUser, wallet: IWallet): Promise<void> {
		await this._db.$transaction(async () => {
			const userPersistenceObject = this._userMapper.toPersistence(user);
			const walletPersistenceObject = this._walletMapper.toPersistence(wallet);

			try {
				await this._db.user.create({ data: userPersistenceObject });
				await this._db.userWallet.create({ data: walletPersistenceObject });
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
					throw new Error(
						`Unique constraint failed on the fields: (\`${(error.meta!.target as unknown[])[0]}\`)`,
					);
				}
			}
		});
	}
}

export class CreateUserUseCase {
	private readonly _userRepository: IUserRepository;
	private readonly _unitOfWork: CreateUserUnitOfWork;

	constructor(
		userRepository: IUserRepository = new UserRepository(),
		unitOfWork = new CreateUserUnitOfWork(),
	) {
		this._userRepository = userRepository;
		this._unitOfWork = unitOfWork;
	}

	public async execute(request: CreateUserDTO): Promise<IUser> {
		const { email, name, password } = this._getValidatedData(request);

		const hashedPassword = await this._hashPassword(password);

		const user = this._createUser(email, name, hashedPassword);
		this._throwErrorIfUserIsInvalid(user);

		const wallet = this._createWallet(user.getValue().idValue);
		this._throwErrorIfWalletIsInvalid(wallet);

		await this._unitOfWork.execute(user.getValue(), wallet.getValue());

		const newUser = await this._findUserWithWalletByUserId(user.getValue().idValue);

		return newUser;
	}

	private _getValidatedData(request: CreateUserDTO): CreateUserDTO {
		this._validatePasswordConfirmation(request.password, request.confirmPassword);

		return request;
	}

	private async _hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

	private _createUser(email: string, name: string, password: string): Result<IUser> {
		return UserFactory.create({
			email,
			name,
			password,
			accountType: USER_ACCOUNT_TYPE.USER,
			isDeleted: false,
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}

	private _createWallet(userId: string): Result<IWallet> {
		return WalletFactory.create({
			userId,
			balance: 0,
			isDeleted: false,
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}

	private async _findUserWithWalletByUserId(userId: string): Promise<IUser> {
		const user = await this._userRepository.findUserById(
			userId,
			{ includeDeleted: false },
			{ wallet: true },
		);
		if (!user) {
			throw Error("Something went wrong while creating user and wallet");
		}

		return user;
	}

	private _validatePasswordConfirmation(password: string, confirmPassword: string): void {
		if (password !== confirmPassword) {
			throw Error("Password and confirm password do not match");
		}
	}

	private _throwErrorIfUserIsInvalid(user: Result<IUser>): void {
		if (user.isFailure) {
			throw Error(defaultTo("Failed to create user", user.getErrorMessage()));
		}
	}

	private _throwErrorIfWalletIsInvalid(wallet: Result<IWallet>): void {
		if (wallet.isFailure) {
			throw Error(defaultTo("Failed to create wallet", wallet.getErrorMessage()));
		}
	}
}
