import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { FindUserByEmailDTO, FindUserByIdDTO } from "@/modules/user/src/dtos/userDTO";
import { FindUserByEmailUseCase } from "@/modules/user/src/useCase/findUserByEmailUseCase";
import { FindUserByIdUseCase } from "@/modules/user/src/useCase/findUserByIdUseCase";
import { UpdateUserUseCase } from "@/modules/user/src/useCase/updateUserUseCase";

export interface IUserService {
	findUserByEmail(dto: FindUserByEmailDTO): Promise<IUser | null>;
	findUserById(dto: FindUserByIdDTO): Promise<IUser | null>;
	updateUser(user: IUser): Promise<IUser | null>;
}

export class UserService implements IUserService {
	constructor(
		private _findUserByEmailUseCase = new FindUserByEmailUseCase(),
		private _findUserByIdUseCase = new FindUserByIdUseCase(),
		private _updateUserUseCase = new UpdateUserUseCase(),
	) {}

	public async findUserByEmail(dto: FindUserByEmailDTO): Promise<IUser | null> {
		return this._findUserByEmailUseCase.execute(dto);
	}

	public async findUserById(dto: FindUserByIdDTO): Promise<IUser | null> {
		return this._findUserByIdUseCase.execute(dto);
	}

	public async updateUser(user: IUser): Promise<IUser | null> {
		return this._updateUserUseCase.execute(user);
	}
}
