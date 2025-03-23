import type { IVerification } from "@/modules/verification/src/domain/classes/verification";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import { VerificationMapper } from "@/modules/verification/src/mappers/verificationMapper";
import { db } from "@/shared/infrastructure/database";

export interface VerificationHydrateOption {
	user?: boolean;
}

export interface IVerificationRepository {
	findVerificationById(
		verificationId: string,
		hydrate?: VerificationHydrateOption,
	): Promise<IVerification | null>;
	findPendingVerificationByUserId(
		userId: string,
		hydrate?: VerificationHydrateOption,
	): Promise<IVerification | null>;
	findVerificationByUserIdAndCode(
		email: string,
		code: string,
		hydrate?: VerificationHydrateOption,
	): Promise<IVerification | null>;
	updateVerification(verification: IVerification): Promise<IVerification | null>;
}

export class VerificationRepository implements IVerificationRepository {
	private _database;
	private _mapper;

	constructor(database = db.userVerification, mapper = VerificationMapper) {
		this._database = database;
		this._mapper = mapper;
	}

	public async findVerificationById(
		verificationId: string,
		hydrate?: VerificationHydrateOption,
	): Promise<IVerification | null> {
		const verification = await this._database.findFirst({
			where: { id: verificationId },
			include: this._hydrateFilter(hydrate),
		});
		if (!verification) {
			return null;
		}

		return this._mapper.toDomain(verification);
	}

	public async findPendingVerificationByUserId(
		userId: string,
		hydrate?: VerificationHydrateOption,
	): Promise<IVerification | null> {
		const verification = await this._database.findFirst({
			where: {
				userId,
				status: VERIFICATION_STATUS.PENDING,
			},
			include: this._hydrateFilter(hydrate),
		});
		if (!verification) {
			return null;
		}

		return this._mapper.toDomain(verification);
	}

	public async findVerificationByUserIdAndCode(
		userId: string,
		code: string,
		hydrate?: VerificationHydrateOption,
	): Promise<IVerification | null> {
		const verification = await this._database.findFirst({
			where: { userId, code },
			include: this._hydrateFilter(hydrate),
		});
		if (!verification) {
			return null;
		}

		return this._mapper.toDomain(verification);
	}

	public async updateVerification(verification: IVerification): Promise<IVerification | null> {
		try {
			const verificationRaw = await this._database.update({
				where: { id: verification.idValue },
				data: this._mapper.toPersistence(verification),
			});

			return this._mapper.toDomain(verificationRaw);
		} catch {
			return null;
		}
	}

	private _hydrateFilter(hydrate?: VerificationHydrateOption) {
		return {
			user: hydrate?.user ?? true,
		};
	}
}
