import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/entities/auction.entity';
import { Bid } from 'src/entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Bid])],
  exports: [AuctionService],
  providers: [AuctionService],
  controllers: [AuctionController],
})
export class AuctionModule {}
