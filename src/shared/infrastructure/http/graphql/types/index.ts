import { AuditLog } from "@/shared/infrastructure/http/graphql/types/auditLog";
import { Transaction } from "@/shared/infrastructure/http/graphql/types/transaction";
import { User } from "@/shared/infrastructure/http/graphql/types/user";
import { Verification } from "@/shared/infrastructure/http/graphql/types/verification";
import { Wallet } from "@/shared/infrastructure/http/graphql/types/wallet";

export default [AuditLog, Transaction, User, Verification, Wallet];
