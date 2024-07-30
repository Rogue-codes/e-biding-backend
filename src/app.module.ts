import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Admin } from './entities/admin.entity';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './email/email.module';
import { OTP } from './entities/OTP.entity';

dotenv.config();

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'jay@daniel99',
      database: 'E-BIDING',
      entities: [Admin, User, OTP],
      synchronize: true,
    }),
    AdminModule,
    AuthModule,
    MulterModule.register({
      limits: {
        fieldSize: 1024 * 1024 * 10,
      },
    }),
    CloudinaryModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
