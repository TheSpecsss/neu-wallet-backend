import { type IUserFactory, UserFactory } from "@/modules/user/src/domain/factory";
import { type IWallet, Wallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletBalance } from "@/modules/wallet/src/domain/classes/walletBalance";
import { Result } from "@/shared/core/result";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

export interface IWalletFactory {
	id?: string;
	userId: string;
	user?: IUserFactory | null;
	balance: number;
	isDeleted: boolean;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export class WalletFactory {
	public static create(props: IWalletFactory): Result<IWallet> {
		const balanceOrError = WalletBalance.create(props.balance);

		const guardResult = Result.combine([balanceOrError]);
		if (guardResult.isFailure) return guardResult as Result<IWallet>;

		return Result.ok<IWallet>(
			Wallet.create({
				...props,
				id: new SnowflakeID(props.id),
				userId: new SnowflakeID(props.userId),
				user: props.user ? UserFactory.create(props.user).getValue() : null,
				balance: balanceOrError.getValue(),
			}),
		);
	}

	public static clone(wallet: IWallet): IWallet {
		return Wallet.create(wallet);
	}
}
