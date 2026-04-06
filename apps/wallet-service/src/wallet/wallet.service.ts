import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@repo/prisma';
import { IUserServiceClient } from '@repo/proto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { GetWalletDto } from './dto/get-wallet.dto';
import { CreditWalletDto } from './dto/credit-wallet.dto';
import { DebitWalletDto } from './dto/debit-wallet.dto';

@Injectable()
export class WalletService implements OnModuleInit {
  private userService: IUserServiceClient;

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientGrpc,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService<IUserServiceClient>('UserService');
  }

  async createWallet(data: CreateWalletDto) {
    // Verify user exists — propagates NOT_FOUND from user-service if missing
    await firstValueFrom(this.userService.getUserById({ id: data.userId }));

    const existing = await this.prisma.wallet.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: `Wallet already exists for user ${data.userId}`,
      });
    }

    const wallet = await this.prisma.wallet.create({
      data: { userId: data.userId },
    });

    return this.toResponse(wallet);
  }

  async getWallet(data: GetWalletDto) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: data.id },
    });

    if (!wallet) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Wallet with id ${data.id} not found`,
      });
    }

    return this.toResponse(wallet);
  }

  async creditWallet(data: CreditWalletDto) {
    if (data.amount <= 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Credit amount must be greater than zero',
      });
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { id: data.id } });
    if (!wallet) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Wallet with id ${data.id} not found`,
      });
    }

    const updated = await this.prisma.wallet.update({
      where: { id: data.id },
      data: { balance: { increment: data.amount } },
    });

    return this.toResponse(updated);
  }

  async debitWallet(data: DebitWalletDto) {
    if (data.amount <= 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Debit amount must be greater than zero',
      });
    }

    // Use Prisma $transaction to ensure atomic read-check-update
    const updated = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { id: data.id } });

      if (!wallet) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: `Wallet with id ${data.id} not found`,
        });
      }

      const newBalance = Number(wallet.balance) - data.amount;
      if (newBalance < 0) {
        throw new RpcException({
          code: status.FAILED_PRECONDITION,
          message: `Insufficient balance. Current: ${wallet.balance}, Requested: ${data.amount}`,
        });
      }

      return tx.wallet.update({
        where: { id: data.id },
        data: { balance: newBalance },
      });
    });

    return this.toResponse(updated);
  }

  private toResponse(wallet: {
    id: string;
    userId: string;
    balance: any;
    createdAt: Date;
  }) {
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: Number(wallet.balance),
      createdAt: wallet.createdAt.toISOString(),
    };
  }
}
