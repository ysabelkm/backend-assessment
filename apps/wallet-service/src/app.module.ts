import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from '@repo/prisma';
import { USER_PROTO_PATH } from '@repo/proto';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    PrismaModule,
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: USER_PROTO_PATH,
          url: `${process.env.USER_SERVICE_HOST ?? 'localhost'}:${process.env.USER_SERVICE_PORT ?? 5001}`,
        },
      },
    ]),
    WalletModule,
  ],
})
export class AppModule {}
