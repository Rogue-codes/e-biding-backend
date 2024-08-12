import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auction } from 'src/entities/auction.entity';
import { Repository } from 'typeorm';
import { CreateAuctionDto } from './dto/create.auction.dto';
import { UpdateAuctionDto } from './dto/update.auction.dto';
import { Bid } from 'src/entities/bid.entity';

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
  ) {}

  checkExistence = async (field: keyof CreateAuctionDto, value: any) => {
    const existingEntry = await this.auctionRepository.findOne({
      where: { [field]: value },
    });
    if (existingEntry) {
      throw new HttpException(
        `Auction with ${field}: ${value} already exists`,
        400,
      );
    }
  };

  async genAuctionId() {
    let existingAuctionId;

    do {
      const prefix = 'NGA';
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      const generatedAuctionId = prefix + randomNumber;

      try {
        existingAuctionId = await this.auctionRepository.findOne({
          where: { bidId: generatedAuctionId },
        });
      } catch (error) {
        throw new InternalServerErrorException(
          'Error fetching auctions: ' + error.message,
        );
      }

      if (!existingAuctionId) {
        return generatedAuctionId;
      }
    } while (existingAuctionId);

    return null;
  }

  async createAuction(auction: CreateAuctionDto): Promise<Auction> {
    await this.checkExistence('bidId', auction.bidId);

    console.log('obj', auction);

    const newAuction = this.auctionRepository.create({
      ...auction,
    });

    try {
      await this.auctionRepository.save(newAuction);
      return newAuction;
    } catch (err) {
      throw new HttpException('Error creating auction: ' + err.message, 500);
    }
  }

  async getAuctions(
    page: number,
    limit: number,
    search?: string,
    filter?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    data: Auction[];
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  }> {
    const queryBuilder = this.auctionRepository.createQueryBuilder('auction');

    // Search functionality
    if (search) {
      queryBuilder
        .where('auction.bidId ILIKE :search', { search: `%${search}%` })
        .orWhere('auction.bidDescription ILIKE :search', {
          search: `%${search}%`,
        });
    }

    // Filter by date functionality
    if (startDate && endDate) {
      queryBuilder.andWhere(
        'auction.startDate BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('auction.startDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('auction.startDate <= :endDate', { endDate });
    }

    // Pagination
    queryBuilder.skip(page > 0 ? (page - 1) * limit : 0);
    queryBuilder.take(limit || 10);

    // Selecting specific fields
    queryBuilder.select([
      'auction.id',
      'auction.bidId',
      'auction.bidDescription',
      'auction.itemDescription',
      'auction.startingAmount',
      'auction.bidRequirements',
      'auction.categories',
      'auction.itemImg',
      'auction.endDate',
      'auction.startDate',
    ]);

    const [data, total] = await queryBuilder.getManyAndCount();

    const lastPage = Math.ceil(total / (limit ? limit : 10));

    const auctionWithBids = await Promise.all(
      data.map(async (auction) => {
        const bids = await this.bidRepository.find({
          where: {
            auction: { id: auction.id },
          },
          order: { createdAt: 'DESC' },
        });

        return {
          ...auction,
          bids,
        };
      }),
    );

    return {
      data: auctionWithBids,
      total,
      page,
      limit,
      lastPage,
    };
  }

  async getAuction(id: number): Promise<Auction> {
    const auction = await this.auctionRepository.findOneBy({
      id,
    });

    if (!auction) {
      throw new NotFoundException('auction not found');
    }

    return auction;
  }

  async updateAuction(id: number, auction: UpdateAuctionDto): Promise<Auction> {
    const existingAuction = await this.auctionRepository.findOneBy({
      id,
    });

    if (!existingAuction) {
      throw new NotFoundException('Auction not found');
    }

    const existingAuctionEndDate = new Date(existingAuction.endDate);
    const today = new Date();

    if (existingAuctionEndDate < today) {
      throw new HttpException('Auction has already ended', 400);
    }


    Object.assign(existingAuction, auction);

    try {
      await this.auctionRepository.save(existingAuction);
      return existingAuction;
    } catch (error) {
      throw new InternalServerErrorException('Error updating the auction');
    }
  }

  async deleteAuction(id: number): Promise<String> {
    const auction = await this.auctionRepository.findOneBy({ id });

    if (!auction) {
      throw new NotFoundException('auction not found');
    }

    try {
      const deletedAuction = await this.auctionRepository.delete(auction.id);
      return 'auction deleted Successfully';
    } catch (error) {
      throw new Error('Error deleting auction');
    }
  }
}
