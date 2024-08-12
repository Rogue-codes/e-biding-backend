import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bid } from 'src/entities/bid.entity';
import { Repository } from 'typeorm';
import { CreateBidDto } from './dto/create.bid.dto';
import { AuctionService } from 'src/auction/auction.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/entities/user.entity';
import { UpdateBidDto } from './dto/update.bid.dto';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auctionService: AuctionService,
    private readonly userService: UserService,
  ) {}

  async createBid(bid: CreateBidDto, userId: number) {
    // check if auction exist
    const auction = await this.auctionService.getAuction(bid.auction);

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    //check if auction is till valid
    const now = new Date();
    const auctionStartDate = new Date(auction.startDate);
    const auctionEndDate = new Date(auction.endDate);

    if (now < auctionStartDate || now > auctionEndDate) {
      throw new HttpException('Auction is not active yet or has ended', 400);
    }

    // bid amount must be greater than auction startAMount
    if (auction.startingAmount > bid.bidAmount) {
      throw new HttpException(
        `Bid amount must be greater than the auction start amount of ${auction.startingAmount}`,
        400,
      );
    }

    // cannot bid lower than the current highest bid
    const allBids = await this.bidRepository.find({
      where: { auction: { id: bid.auction } },
      relations: ['user', 'auction'],
    });

    const notHighestBid = allBids.some((b) => b.bidAmount > bid.bidAmount);

    if (notHighestBid) {
      throw new HttpException(
        'Bid amount must be higher than the current highest bid',
        400,
      );
    }

    // check if user exist
    const user = await this.userService.getUser(userId);

    if (!user || !user.isActive || !user.isVerified) {
      throw new HttpException('No active user found', 400);
    }

    // check if bid exists for user
    const alreadyExistingBid = allBids.some((b) => b.user.id === userId);
    if (alreadyExistingBid) {
      throw new HttpException(
        'You have already placed a bid on this auction. To proceed, you can either withdraw your current bid or increase the bid amount.',
        400,
      );
    }

    // create bid
    const newBid = this.bidRepository.create({
      ...bid,
      auction,
      user,
    });
    await this.bidRepository.save(newBid);

    return newBid;
  }

  async getBids(auctionId: number, page: number, limit: number): Promise<any> {
    const auction = await this.auctionService.getAuction(auctionId);

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const bids = await this.bidRepository.find({
      where: { auction: { id: auction.id } },
      order: { bidAmount: 'DESC' },
      relations: ['user', 'auction'],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Map the response to exclude sensitive fields
    const sanitizedBids = bids.map((bid) => {
      const { password, ...userWithoutPassword } = bid.user;
      return {
        ...bid,
        user: userWithoutPassword,
      };
    });

    return sanitizedBids;
  }

  async getBid(bidId: number): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: {
        id: bidId,
      },
      relations: ['user', 'auction'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return bid;
  }

  async updateBid(
    bidId: number,
    userId: number,
    payload: UpdateBidDto,
  ): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: {
        id: bidId,
      },
      relations: ['user', 'auction'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // check if bid belongs to user
    if (bid.user.id !== userId) {
      throw new HttpException(
        'User does not have permission to update this bid',
        403,
      );
    }

    //check if auction is till valid
    const now = new Date();
    const auctionStartDate = new Date(bid.auction.startDate);
    const auctionEndDate = new Date(bid.auction.endDate);

    if (now < auctionStartDate || now > auctionEndDate) {
      throw new HttpException('Auction is not active yet or has ended', 400);
    }

    // cannot bid lower than the current highest bid
    const allBids = await this.bidRepository.find({
      where: { auction: { id: bid.auction.id } },
    });

    const notHighestBid = allBids.some((b) => b.bidAmount > payload.bidAmount);
    if (notHighestBid) {
      throw new HttpException(
        'Bid amount must be higher than the current highest bid',
        400,
      );
    }

    Object.assign(bid, payload);

    try {
      await this.bidRepository.save(bid);
      return bid;
    } catch (error) {
      throw new InternalServerErrorException('Error updating the bid');
    }
  }

  async withdrawBid(bidId: number, userId: number): Promise<string> {
    const bid = await this.bidRepository.findOne({
      where: {
        id: bidId,
      },
      relations: ['user', 'auction'],
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // check if bid belongs to user
    if (bid.user.id !== userId) {
      throw new HttpException(
        'User does not have permission to withdraw this bid',
        403,
      );
    }

    //check if auction is till valid
    // const now = new Date();
    // const auctionStartDate = new Date(bid.auction.startDate);
    // const auctionEndDate = new Date(bid.auction.endDate);

    // if (now < auctionStartDate || now > auctionEndDate) {
    //   throw new HttpException('Auction is not active yet or has ended', 400);
    // }

    // cannot bid lower than the current highest bid
    // const allBids = await this.bidRepository.find({
    //   where: { auction: { id: bid.auction.id } },
    // });

    // const notHighestBid = allBids.some((b) => b.bidAmount > payload.bidAmount);
    // if (notHighestBid) {
    //   throw new HttpException(
    //     'Bid amount must be higher than the current highest bid',
    //     400,
    //   );
    // }
    try {
      await this.bidRepository.delete(bidId);
      return 'bid withdrawn successfully';
    } catch (error) {
      throw new InternalServerErrorException('Error withdrawing bid');
    }
  }
}
