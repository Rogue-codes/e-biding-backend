import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { EmailModule } from 'src/email/email.module';
import { OTP } from 'src/entities/OTP.entity';

@Module({
  imports:[CloudinaryModule,TypeOrmModule.forFeature([User,OTP]),EmailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
