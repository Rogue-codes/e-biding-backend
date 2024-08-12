import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { EmailModule } from 'src/email/email.module';
import { OTP } from 'src/entities/OTP.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User,OTP]),EmailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
