# Backend Assessment — Microservice Wallet System

A monorepo containing two NestJS gRPC microservices: **User Service** and **Wallet Service**, backed by PostgreSQL via Prisma ORM.

---

## Architecture

```
backend-assessment/
├── apps/
│   ├── user-service/       # gRPC on port 5001
│   └── wallet-service/     # gRPC on port 5002
├── packages/
│   ├── proto/              # Shared .proto files + TS interfaces
│   └── prisma/             # Shared Prisma schema + PrismaService
└── README.md
```

**Inter-service communication:** Wallet Service calls User Service via gRPC to verify a user exists before creating a wallet.

---

## Prerequisites

- Node.js >= 18
- PostgreSQL running locally (or update `DATABASE_URL` in `.env`)
- npm >= 8 (workspaces support)

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd backend-assessment
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL
```

Default `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wallet_db
USER_SERVICE_PORT=5001
USER_SERVICE_HOST=localhost
WALLET_SERVICE_PORT=5002
LOG_LEVEL=info
```

### 3. Run database migrations

```bash
# Generate Prisma client
npm run db:generate

# Create tables via migration
npm run db:migrate
# When prompted, enter a migration name e.g. "init"
```

### 4. Start the services

Open two terminal windows:

**Terminal 1 — User Service:**
```bash
npm run start:user:dev
```

**Terminal 2 — Wallet Service:**
```bash
npm run start:wallet:dev
```

---

## Testing with grpcurl

Install [grpcurl](https://github.com/fullstorydev/grpcurl) to test gRPC endpoints directly.

### User Service (port 5001)

**Create a user:**
```bash
grpcurl -plaintext -proto packages/proto/src/user.proto \
  -d '{"email": "alice@example.com", "name": "Alice"}' \
  localhost:5001 user.UserService/CreateUser
```

**Get user by ID:**
```bash
grpcurl -plaintext -proto packages/proto/src/user.proto \
  -d '{"id": "<user-id>"}' \
  localhost:5001 user.UserService/GetUserById
```

### Wallet Service (port 5002)

**Create a wallet** (user must exist first):
```bash
grpcurl -plaintext -proto packages/proto/src/wallet.proto \
  -d '{"user_id": "<user-id>"}' \
  localhost:5002 wallet.WalletService/CreateWallet
```

**Get wallet:**
```bash
grpcurl -plaintext -proto packages/proto/src/wallet.proto \
  -d '{"id": "<wallet-id>"}' \
  localhost:5002 wallet.WalletService/GetWallet
```

**Credit wallet:**
```bash
grpcurl -plaintext -proto packages/proto/src/wallet.proto \
  -d '{"id": "<wallet-id>", "amount": 100.00}' \
  localhost:5002 wallet.WalletService/CreditWallet
```

**Debit wallet:**
```bash
grpcurl -plaintext -proto packages/proto/src/wallet.proto \
  -d '{"id": "<wallet-id>", "amount": 50.00}' \
  localhost:5002 wallet.WalletService/DebitWallet
```

---

## Example Flow

```bash
# 1. Create user
grpcurl -plaintext -proto packages/proto/src/user.proto \
  -d '{"email": "alice@example.com", "name": "Alice"}' \
  localhost:5001 user.UserService/CreateUser
# → { "id": "clxyz...", "email": "alice@example.com", "name": "Alice", "createdAt": "..." }

# 2. Create wallet (use the id from step 1)
grpcurl -plaintext -proto packages/proto/src/wallet.proto \
  -d '{"user_id": "clxyz..."}' \
  localhost:5002 wallet.WalletService/CreateWallet
# → { "id": "clabc...", "userId": "clxyz...", "balance": 0, "createdAt": "..." }

# 3. Credit wallet
grpcurl -plaintext -proto packages/proto/src/wallet.proto \
  -d '{"id": "clabc...", "amount": 500}' \
  localhost:5002 wallet.WalletService/CreditWallet
# → { "balance": 500 }

# 4. Debit wallet
grpcurl -plaintext -proto packages/proto/src/wallet.proto \
  -d '{"id": "clabc...", "amount": 200}' \
  localhost:5002 wallet.WalletService/DebitWallet
# → { "balance": 300 }

# 5. Get wallet
grpcurl -plaintext -proto packages/proto/src/wallet.proto \
  -d '{"id": "clabc..."}' \
  localhost:5002 wallet.WalletService/GetWallet
# → { "balance": 300 }
```

---

## Error Handling

| Scenario | gRPC Status |
|---|---|
| User not found | `NOT_FOUND` (5) |
| Wallet not found | `NOT_FOUND` (5) |
| Email already registered | `ALREADY_EXISTS` (6) |
| Wallet already exists for user | `ALREADY_EXISTS` (6) |
| Insufficient balance | `FAILED_PRECONDITION` (9) |
| Amount ≤ 0 | `INVALID_ARGUMENT` (3) |

---

## Build for Production

```bash
npm run build:user
npm run build:wallet

# Run compiled output
node dist/user-service/main
node dist/wallet-service/main
```
