import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminModule } from 'src/admin/admin.module';
import * as dotenv from 'dotenv';
import { UserModule } from 'src/user/user.module';

dotenv.config();

@Module({
  imports: [
    AdminModule,
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
