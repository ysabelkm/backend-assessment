import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USER_PROTO_PATH } from '@repo/proto';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
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
  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
