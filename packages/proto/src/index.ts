import { join } from 'path';
import { Observable } from 'rxjs';

// User interfaces

export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface GetUserByIdRequest {
  id: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Wallet interfaces

export interface CreateWalletRequest {
  userId: string;
}

export interface GetWalletRequest {
  id: string;
}

export interface CreditWalletRequest {
  id: string;
  amount: number;
}

export interface DebitWalletRequest {
  id: string;
  amount: number;
}

export interface WalletResponse {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
}

// ─── gRPC client interface (used by wallet-service to call user-service) ────

export interface IUserServiceClient {
  getUserById(data: GetUserByIdRequest): Observable<UserResponse>;
  createUser(data: CreateUserRequest): Observable<UserResponse>;
}

// ─── Proto path helpers ──────────────────────────────────────────────────────
// __dirname resolves correctly in both:
//   - ts-node (dev): packages/proto/src/
//   - nest build (prod): dist/proto/ (copied via nest-cli.json assets)

export const USER_PROTO_PATH = join(__dirname, 'user.proto');
export const WALLET_PROTO_PATH = join(__dirname, 'wallet.proto');
