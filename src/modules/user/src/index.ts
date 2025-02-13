import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { FindUserByEmailAndPasswordDTO } from "@/modules/user/src/dtos/userDTO";
import { FindUserByEmailAndPasswordUseCase } from "@/modules/user/src/useCase/findUserByEmailAndPasswordUseCase";

export interface IUserService {
	findUserByEmailAndPassword(dto: FindUserByEmailAndPasswordDTO): Promise<IUser | null>;
}

export class UserService {
	private _findUserByEmailAndPasswordUseCase: FindUserByEmailAndPasswordUseCase;

	constructor(findUserByEmailAndPasswordUseCase = new FindUserByEmailAndPasswordUseCase()) {
		this._findUserByEmailAndPasswordUseCase = findUserByEmailAndPasswordUseCase;
	}

	public async findUserByEmailAndPassword(
		dto: FindUserByEmailAndPasswordDTO,
	): Promise<IUser | null> {
		return this._findUserByEmailAndPasswordUseCase.execute(dto);
	}
}
