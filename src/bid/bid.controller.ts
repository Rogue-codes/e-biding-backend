import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BidService } from './bid.service';
import { UserGuard } from 'src/guards/user.guard';
import { CreateBidDto } from './dto/create.bid.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateBidDto } from './dto/update.bid.dto';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @UseGuards(UserGuard)
  @Post('create')
  async createBid(@Body() bid: CreateBidDto, @Res() res, @Req() req) {
    console.log('user', req.user);
    try {
      const auction_ = await this.bidService.createBid(bid, req?.user?.id);
      return res.status(201).json({
        success: true,
        message: 'bid submitted successfully',
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

  @UseGuards(AdminGuard)
  @Get('auction/:id')
  async getBids(
    @Param('id') id: number,
    @Res() res,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    try {
      const bids = await this.bidService.getBids(id, page, limit);
      return res.status(200).json({
        success: true,
        message: 'bids retrieved successfully',
        bids,
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
  @Get(':id')
  async getBid(@Param('id') id: number, @Res() res) {
    try {
      const bid = await this.bidService.getBid(id);
      return res.status(200).json({
        success: true,
        message: 'bid retrieved successfully',
        bid,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @Patch(':id')
  async updateBid(
    @Param('id') id: number,
    @Body() payload: UpdateBidDto,
    @Res() res,
    @Req() req,
  ) {
    try {
      const bid = await this.bidService.updateBid(id, req?.user?.id, payload);
      return res.status(200).json({
        success: true,
        message: 'bid updated successfully',
        bid,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(UserGuard)
  @Delete(':id')
  async withdrawBid(
    @Param('id') id: number,
    @Res() res,
    @Req() req,
  ) {
    try {
      const bid = await this.bidService.withdrawBid(id, req?.user?.id);
      return res.status(200).json({
        success: true,
        message: 'bid withdrawn successfully',
      });
    } catch (error) {
      console.log(error);
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
  }
}
