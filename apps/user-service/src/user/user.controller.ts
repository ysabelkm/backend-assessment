import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserByIdDto } from './dto/get-user-by-id.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'CreateUser')
  createUser(data: CreateUserDto) {
    return this.userService.createUser(data);
  }

  @GrpcMethod('UserService', 'GetUserById')
  getUserById(data: GetUserByIdDto) {
    return this.userService.getUserById(data);
  }
}
