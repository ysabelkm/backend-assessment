import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { USER_PROTO_PATH } from '@repo/proto';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: USER_PROTO_PATH,
      url: `0.0.0.0:${process.env.USER_SERVICE_PORT ?? 5001}`,
    },
  });

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen();
  console.log(`User Service running on port ${process.env.USER_SERVICE_PORT ?? 5001}`);
}

bootstrap();
