import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { GetWalletDto } from './dto/get-wallet.dto';
import { CreditWalletDto } from './dto/credit-wallet.dto';
import { DebitWalletDto } from './dto/debit-wallet.dto';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @GrpcMethod('WalletService', 'CreateWallet')
  createWallet(data: CreateWalletDto) {
    return this.walletService.createWallet(data);
  }

  @GrpcMethod('WalletService', 'GetWallet')
  getWallet(data: GetWalletDto) {
    return this.walletService.getWallet(data);
  }

  @GrpcMethod('WalletService', 'CreditWallet')
  creditWallet(data: CreditWalletDto) {
    return this.walletService.creditWallet(data);
  }

  @GrpcMethod('WalletService', 'DebitWallet')
  debitWallet(data: DebitWalletDto) {
    return this.walletService.debitWallet(data);
  }
}
