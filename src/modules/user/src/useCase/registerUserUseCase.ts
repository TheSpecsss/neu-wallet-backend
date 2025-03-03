import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserFactory } from "@/modules/user/src/domain/factory";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { RegisterUserDTO } from "@/modules/user/src/dtos/userDTO";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import type { IVerification } from "@/modules/verification/src/domain/classes/verification";
import { VerificationFactory } from "@/modules/verification/src/domain/factory";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import { VerificationMapper } from "@/modules/verification/src/mappers/verificationMapper";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletFactory } from "@/modules/wallet/src/domain/factory";
import { WalletMapper } from "@/modules/wallet/src/mappers/walletMapper";
import type { Result } from "@/shared/core/result";
import { generateVerificationCode } from "@/shared/infrastructure/authentication/generateVerificationCode";
import { saltPassword } from "@/shared/infrastructure/authentication/saltPassword";
import { db } from "@/shared/infrastructure/database";
import { sendVerificationEmail } from "@/shared/infrastructure/smtp/helpers/sendVerificationEmail";
import { Prisma } from "@prisma/client";
import { defaultTo } from "rambda";

class RegisterUserUnitOfWork {
	private readonly _db: typeof db;
	private readonly _userMapper: typeof UserMapper;
	private readonly _walletMapper: typeof WalletMapper;
	private readonly _verificationMapper: typeof VerificationMapper;

	constructor(
		database = db,
		userMapper = UserMapper,
		walletMapper = WalletMapper,
		verificationMapper = VerificationMapper,
	) {
		this._db = database;
		this._userMapper = userMapper;
		this._walletMapper = walletMapper;
		this._verificationMapper = verificationMapper;
	}

	public async execute(user: IUser, wallet: IWallet, verification: IVerification): Promise<void> {
		await this._db.$transaction(async () => {
			const userPersistenceObject = this._userMapper.toPersistence(user);
			const walletPersistenceObject = this._walletMapper.toPersistence(wallet);
			const verificationPersistenceObject = this._verificationMapper.toPersistence(verification);

			try {
				await this._db.user.create({ data: userPersistenceObject });
				await this._db.userWallet.create({ data: walletPersistenceObject });
				await this._db.userVerification.create({ data: verificationPersistenceObject });
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

export class RegisterUserUseCase {
	private readonly _userRepository: IUserRepository;
	private readonly _unitOfWork: RegisterUserUnitOfWork;

	constructor(
		userRepository: IUserRepository = new UserRepository(),
		unitOfWork = new RegisterUserUnitOfWork(),
	) {
		this._userRepository = userRepository;
		this._unitOfWork = unitOfWork;
	}

	public async execute(request: RegisterUserDTO): Promise<IUser> {
		const { email, name, password } = await this._getValidatedData(request);

		const hashedPassword = await saltPassword(password);

		const user = this._createUser(email, name, hashedPassword);
		const wallet = this._createWallet(user.idValue);
		const verification = this._createVerification(user.idValue);

		await this._unitOfWork.execute(user, wallet, verification);

		sendVerificationEmail(email, verification.code);

		const newUser = await this._findUserWithWalletByUserId(user.idValue);

		return newUser;
	}

	private async _getValidatedData(request: RegisterUserDTO): Promise<RegisterUserDTO> {
		await this._validateActiveEmail(request.email);
		this._validatePasswordConfirmation(request.password, request.confirmPassword);

		return request;
	}

	private _createUser(email: string, name: string, password: string): IUser {
		const userDomainObject = UserFactory.create({
			email,
			name,
			password,
			accountType: USER_ACCOUNT_TYPE.USER,
			isDeleted: false,
			isVerified: false,
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		this._throwErrorIfUserIsInvalid(userDomainObject);

		return userDomainObject.getValue();
	}

	private _createWallet(userId: string): IWallet {
		const walletDomainObject = WalletFactory.create({
			userId,
			balance: 0,
			isDeleted: false,
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		this._throwErrorIfWalletIsInvalid(walletDomainObject);

		return walletDomainObject.getValue();
	}

	private _createVerification(userId: string): IVerification {
		const verificationDomainObject = VerificationFactory.create({
			userId,
			code: generateVerificationCode(),
			status: VERIFICATION_STATUS.PENDING,
			expiredAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		this._throwErrorIfVerificationIsInvalid(verificationDomainObject);

		return verificationDomainObject.getValue();
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

	private async _validateActiveEmail(email: string): Promise<void> {
		const user = await this._userRepository.findUserByEmail(email);

		if (user && !user.isDeleted) {
			if (!user.isVerified) {
				throw Error(
					`${email} already exist but not verified. Please verify your account`,
				);
			}

			throw Error(`${email} already exist`);
		}
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

	private _throwErrorIfVerificationIsInvalid(verification: Result<IVerification>): void {
		if (verification.isFailure) {
			throw Error(defaultTo("Failed to create verification", verification.getErrorMessage()));
		}
	}
}
