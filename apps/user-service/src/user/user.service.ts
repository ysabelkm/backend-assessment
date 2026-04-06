import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { PrismaService } from '@repo/prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserByIdDto } from './dto/get-user-by-id.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: `Email ${data.email} is already registered`,
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
      },
    });

    return this.toResponse(user);
  }

  async getUserById(data: GetUserByIdDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.id },
    });

    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `User with id ${data.id} not found`,
      });
    }

    return this.toResponse(user);
  }

  private toResponse(user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
