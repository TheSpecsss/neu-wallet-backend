import type { IUser } from "@/modules/user/src/domain/classes/user";
import type {
	FindUserByEmailAndPasswordDTO,
	FindUserByEmailDTO,
	FindUserByIdDTO,
} from "@/modules/user/src/dtos/userDTO";
import { FindUserByEmailAndPasswordUseCase } from "@/modules/user/src/useCase/findUserByEmailAndPasswordUseCase";
import { FindUserByEmailUseCase } from "@/modules/user/src/useCase/findUserByEmailUseCase";
import { FindUserByIdUseCase } from "@/modules/user/src/useCase/findUserByIdUseCase";
import { UpdateUserUseCase } from "@/modules/user/src/useCase/updateUserUseCase";

export interface IUserService {
	findUserByEmailAndPassword(dto: FindUserByEmailAndPasswordDTO): Promise<IUser | null>;
	findUserByEmail(dto: FindUserByEmailDTO): Promise<IUser | null>;
	findUserById(dto: FindUserByIdDTO): Promise<IUser | null>;
	updateUser(user: IUser): Promise<IUser | null>;
}

export class UserService implements IUserService {
	private _findUserByEmailAndPasswordUseCase: FindUserByEmailAndPasswordUseCase;
	private _findUserByEmailUseCase: FindUserByEmailUseCase;
	private _findUserByIdUseCase: FindUserByIdUseCase;
	private _updateUserUseCase: UpdateUserUseCase;

	constructor(
		findUserByEmailAndPasswordUseCase = new FindUserByEmailAndPasswordUseCase(),
		findUserByEmailUseCase = new FindUserByEmailUseCase(),
		findUserByIdUseCase = new FindUserByIdUseCase(),
		updateUserUseCase = new UpdateUserUseCase(),
	) {
		this._findUserByEmailAndPasswordUseCase = findUserByEmailAndPasswordUseCase;
		this._findUserByEmailUseCase = findUserByEmailUseCase;
		this._findUserByIdUseCase = findUserByIdUseCase;
		this._updateUserUseCase = updateUserUseCase;
	}

	public async findUserByEmailAndPassword(
		dto: FindUserByEmailAndPasswordDTO,
	): Promise<IUser | null> {
		return this._findUserByEmailAndPasswordUseCase.execute(dto);
	}

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
