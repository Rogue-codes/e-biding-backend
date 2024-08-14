import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create.auction.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateAuctionDto } from './dto/update.auction.dto';

@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get('gen-id')
  async genAuctionId(@Res() res) {
    try {
      const id = await this.auctionService.genAuctionId();
      return res.status(200).json({
        success: true,
        message: 'auction details retrieved successfully',
        data: { id },
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(AdminGuard)
  @Post('create')
  async createAuction(
    @Body() auction: CreateAuctionDto,
    @Res() res,
  ) {

      console.log('updateAuction', auction);
    try {
      const auction_ = await this.auctionService.createAuction(auction);
      return res.status(201).json({
        success: true,
        message: 'Auction created successfully',
        data: auction_,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get('all')
  async getAllAuctions(
    @Res() res,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('filter') filter: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const auctions = await this.auctionService.getAuctions(
        page,
        limit,
        search,
        filter,
        startDate,
        endDate,
      );
      return res.status(200).json({
        success: true,
        message: 'Auctions retrieved successfully',
        ...auctions,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Get(':id')
  async getAuction(@Param('id') id: number, @Res() res) {
    try {
      const response = await this.auctionService.getAuction(id);
      return res.status(200).json({
        success: true,
        message: 'auction details retrieved successfully',
        data: { ...response },
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(AdminGuard)
  @Post('update/:id')
  async updateAuction(
    @Body() updateAuctionDto: UpdateAuctionDto,
    @Param('id') id: number,
    @Res() res,
  ): Promise<any> {
    try {

      const auction = await this.auctionService.updateAuction(
        id,
        updateAuctionDto,
      );
      return res.status(200).json({
        success: true,
        message: 'Auction updated successfully',
        data: auction,
      });
    } catch (error: any) {
      console.log(error);
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(AdminGuard)
  @Delete('delete/:id')
  async deleteUser(@Param('id') id: number, @Res() res) {
    try {
      const deletedAuction = await this.auctionService.deleteAuction(id);

      return res.status(200).json({
        success: true,
        message: 'Auction deleted successfully',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // @Get("highest-bid/:id")
  // async getHighestBid(@Param('id') id: number, @Res() res) {
  //   try {
  //     const highestBid = await this.auctionService.getHighestBid(id);
  //     return res.status(200).json({
  //       success: true,
  //       message: 'Highest bid retrieved successfully',
  //       data: { highestBid },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(error.status).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }
}
