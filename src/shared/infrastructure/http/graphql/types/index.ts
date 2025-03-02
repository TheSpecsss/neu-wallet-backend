import { Transaction } from "@/shared/infrastructure/http/graphql/types/transaction";
import { User } from "@/shared/infrastructure/http/graphql/types/user";
import { Verification } from "@/shared/infrastructure/http/graphql/types/verification";
import { Wallet } from "@/shared/infrastructure/http/graphql/types/wallet";

export default [User, Wallet, Transaction, Verification];
