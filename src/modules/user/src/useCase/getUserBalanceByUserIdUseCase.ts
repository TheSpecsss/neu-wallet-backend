import type { IUser } from "@/modules/user/src/domain/classes/user";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";

export class GetUserBalanceByUserIdUseCase {
	private _userRepository: IUserRepository;

	constructor(userRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(userId: string): Promise<{ balance: number }> {
		const user = await this._userRepository.findUserById(
			userId,
			{ includeDeleted: false },
			{ wallet: true },
		);

		this._ensureUserDoesExist(userId, user);
		this._ensureUserHaveWallet(userId, user!);

		return { balance: user!.wallet!.balanceValue };
	}

	private _ensureUserDoesExist(userId: string, user: IUser | null) {
		if (!user) {
			throw Error(`User with userId ${userId} cannot be found`);
		}
	}

	private _ensureUserHaveWallet(userId: string, user: IUser) {
		if (!user.wallet) {
			throw Error(`User ${userId} does not have a wallet. Please contact an admin`);
		}
	}
}
