import { beforeAll, describe, expect, it } from "bun:test";
import { CreateUserAuditLogService } from "@/modules/auditLog/src/domain/services/createUserAuditLogService";
import { ACTION_TYPE, type ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";
import {
	AuditLogRepository,
	type IAuditLogRepository,
} from "@/modules/auditLog/src/repositories/auditLogRepository";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

describe("CreateUserAuditLogService", () => {
	let service: CreateUserAuditLogService;
	let auditLogRepository: IAuditLogRepository;
	let userMapper: typeof UserMapper;

	beforeAll(() => {
		service = new CreateUserAuditLogService();
		auditLogRepository = new AuditLogRepository();
		userMapper = UserMapper;
	});

	it("should create a user audit log", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser({ name: "old name", accountType: USER_ACCOUNT_TYPE.USER });

		const oldUser = userMapper.toDomain(targetUser);
		const newUser = userMapper.toDomain({
			...targetUser,
			name: "new name",
			accountType: USER_ACCOUNT_TYPE.SUPER_ADMIN,
		});

		const { idValue: auditLogId } = await service.execute({
			executorId: executorUser.id,
			oldUser,
			newUser,
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

	it("should thrown an error when target does not have the same id", async () => {
		const executorUser = await seedUser();
		const targetUserOne = await seedUser();
		const targetUserTwo = await seedUser();

		const oldUser = userMapper.toDomain(targetUserOne);
		const newUser = userMapper.toDomain(targetUserTwo);

		let errorMessage = "";
		try {
			await service.execute({
				executorId: executorUser.id,
				oldUser,
				newUser,
				actionType: ACTION_TYPE.USER_UPDATE,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("The old and new userId does not match");
	});

	it("should thrown an error when action type is invalid", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser({ name: "old name" });

		const oldUser = userMapper.toDomain(targetUser);
		const newUser = userMapper.toDomain({ ...targetUser, name: "new name" });

		const type = "invalid-audit-log-action-type";

		let errorMessage = "";
		try {
			await service.execute({
				executorId: executorUser.id,
				oldUser,
				newUser,
				actionType: type as ActionTypeKind,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			`Failed to create audit log: ${type} is invalid audit log action type`,
		);
	});
});
