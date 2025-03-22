import { beforeAll, describe, expect, it } from "bun:test";
import { CreateAuditLogService } from "@/modules/auditLog/src/domain/services/createAuditLogService";
import { ACTION_TYPE, type ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";
import {
	AuditLogRepository,
	type IAuditLogRepository,
} from "@/modules/auditLog/src/repositories/auditLogRepository";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { WalletMapper } from "@/modules/wallet/src/mappers/walletMapper";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { Decimal } from "@/shared/domain/decimal";

describe("CreateAuditLogService", () => {
	let service: CreateAuditLogService;
	let auditLogRepository: IAuditLogRepository;
	let userMapper: typeof UserMapper;
	let walletMapper: typeof WalletMapper;

	beforeAll(() => {
		service = new CreateAuditLogService();
		auditLogRepository = new AuditLogRepository();
		userMapper = UserMapper;
		walletMapper = WalletMapper;
	});

	it("should create a user audit log", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser({ name: "old name", accountType: USER_ACCOUNT_TYPE.USER });

		const oldData = userMapper.toDomain(targetUser);
		const newData = userMapper.toDomain({
			...targetUser,
			name: "new name",
			accountType: USER_ACCOUNT_TYPE.SUPER_ADMIN,
		});

		const { idValue: auditLogId } = await service.execute({
			executorId: executorUser.id,
			oldData,
			newData,
			actionType: ACTION_TYPE.USER_UPDATE,
		});

		const auditLog = await auditLogRepository.findAuditLogById(auditLogId);

		expect(auditLog!.executorIdValue).toBe(executorUser.id);
		expect(auditLog!.targetIdValue).toBe(targetUser.id);
		expect(auditLog!.actionTypeValue).toBe(ACTION_TYPE.USER_UPDATE);
		expect(auditLog!.changes).toEqual([
			{ key: "name", values: [{ from: "old name", to: "new name" }] },
			{
				key: "accountType",
				values: [{ from: USER_ACCOUNT_TYPE.USER, to: USER_ACCOUNT_TYPE.SUPER_ADMIN }],
			},
		]);
	});

	it("should create a wallet audit log", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser();
		const targetWallet = await seedWallet({ userId: targetUser.id, balance: new Decimal(500) });

		const oldData = walletMapper.toDomain(targetWallet);
		const newData = walletMapper.toDomain({
			...targetWallet,
			balance: new Decimal(1000),
		});

		const { idValue: auditLogId } = await service.execute({
			executorId: executorUser.id,
			oldData,
			newData,
			actionType: ACTION_TYPE.WALLET_UPDATE,
		});

		const auditLog = await auditLogRepository.findAuditLogById(auditLogId);

		expect(auditLog!.executorIdValue).toBe(executorUser.id);
		expect(auditLog!.targetIdValue).toBe(targetUser.id);
		expect(auditLog!.actionTypeValue).toBe(ACTION_TYPE.WALLET_UPDATE);
		expect(auditLog!.changes).toEqual([{ key: "balance", values: [{ from: "500", to: "1000" }] }]);
	});

	it("should thrown an error when data does not have the same id", async () => {
		const executorUser = await seedUser();
		const targetUserOne = await seedUser();
		const targetUserTwo = await seedUser();

		const oldData = userMapper.toDomain(targetUserOne);
		const newData = userMapper.toDomain(targetUserTwo);

		let errorMessage = "";
		try {
			await service.execute({
				executorId: executorUser.id,
				oldData,
				newData,
				actionType: ACTION_TYPE.USER_UPDATE,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("The old and new ID does not match");
	});

	it("should thrown an error when action type is invalid", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser({ name: "old name" });

		const oldData = userMapper.toDomain(targetUser);
		const newData = userMapper.toDomain({ ...targetUser, name: "new name" });

		const type = "invalid-audit-log-action-type";

		let errorMessage = "";
		try {
			await service.execute({
				executorId: executorUser.id,
				oldData,
				newData,
				actionType: type as ActionTypeKind,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`${type} is invalid audit log action type`);
	});
});
