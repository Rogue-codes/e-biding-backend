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
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './email/email.module';
import { OTP } from './entities/OTP.entity';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { AuctionModule } from './auction/auction.module';
import { BidModule } from './bid/bid.module';

dotenv.config();

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: parseInt(process.env.PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DATABASE,
      entities: [Admin, User, OTP, Auction, Bid],
      synchronize: true,
    }),
    AdminModule,
    AuthModule,
    MulterModule.register({
      limits: {
        fieldSize: 1024 * 1024 * 10,
      },
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
    EmailModule,
    AuctionModule,
    BidModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
