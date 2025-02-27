import type { IUser } from "@/modules/user/src/domain/classes/user";
import type {
	FindUserByEmailAndPasswordDTO,
	FindUserByIdDTO,
} from "@/modules/user/src/dtos/userDTO";
import { FindUserByEmailAndPasswordUseCase } from "@/modules/user/src/useCase/findUserByEmailAndPasswordUseCase";
import { FindUserByIdUseCase } from "@/modules/user/src/useCase/findUserByIdUseCase";

export interface IUserService {
	findUserByEmailAndPassword(dto: FindUserByEmailAndPasswordDTO): Promise<IUser | null>;
	findUserById(dto: FindUserByIdDTO): Promise<IUser | null>;
}

export class UserService implements IUserService {
	private _findUserByEmailAndPasswordUseCase: FindUserByEmailAndPasswordUseCase;
	private _findUserByIdUseCase: FindUserByIdUseCase;

	constructor(
		findUserByEmailAndPasswordUseCase = new FindUserByEmailAndPasswordUseCase(),
		findUserByIdUseCase = new FindUserByIdUseCase(),
	) {
		this._findUserByEmailAndPasswordUseCase = findUserByEmailAndPasswordUseCase;
		this._findUserByIdUseCase = findUserByIdUseCase;
	}

	public async findUserByEmailAndPassword(
		dto: FindUserByEmailAndPasswordDTO,
	): Promise<IUser | null> {
		return this._findUserByEmailAndPasswordUseCase.execute(dto);
	}

	public async findUserById(dto: FindUserByIdDTO): Promise<IUser | null> {
		return this._findUserByIdUseCase.execute(dto);
	}
}
