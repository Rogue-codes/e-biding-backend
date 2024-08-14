import { Module } from '@nestjs/common';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { AuctionModule } from 'src/auction/auction.module';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from 'src/entities/bid.entity';
import { User } from 'src/entities/user.entity';
import { Auction } from 'src/entities/auction.entity';

@Module({
  imports: [AuctionModule, UserModule, TypeOrmModule.forFeature([Bid,User,Auction])],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
