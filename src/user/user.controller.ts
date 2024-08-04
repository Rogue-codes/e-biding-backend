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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create.user.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { verifyEmailDto } from './dto/verifyEmail.dto';
import { User } from 'src/entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('CACDoc'))
  async createUser(
    @Body() user: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res,
  ) {
    try {
      const user_ = await this.userService.createUser(user, file);
      return res.status(200).json({
        success: true,
        message: 'User created successfully',
        data: user_,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(AdminGuard)
  @Patch('approve-user/:id')
  async approveUser(@Param('id') id: number, @Res() res) {
    try {
      const updatedUser = await this.userService.approveUser(id);

      return res.status(200).json({
        success: true,
        message: 'User approved successfully',
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @UseGuards(AdminGuard)
  @Delete('reject-user/:id')
  async deleteUser(@Param('id') id: number, @Res() res) {
    try {
      const rejectedUser = await this.userService.rejectUser(id);

      return res.status(200).json({
        success: true,
        message: 'User REJECTED successfully',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Patch('/verify')
  async verifyEmail(@Body() payload: verifyEmailDto, @Res() res) {
    try {
      const response = await this.userService.verifyEmail(payload);
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: response,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  
  @UseGuards(AdminGuard)
  @Get('all')
  async getAllUsers(
    @Res() res,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('filter') filter: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      // console.log('filter', filter);
      // console.log('startDate', startDate);
      // console.log('endDate', endDate);
      const users = await this.userService.getUsers(
        page,
        limit,
        search,
        filter,
        startDate,
        endDate,
      );
      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }''
  @UseGuards(AdminGuard)
  @Get(':id')
  async findUser(@Param('id') id: number, @Res() res) {
    try {
      const response = await this.userService.getUser(id);
      return res.status(200).json({
        success: true,
        message: 'user details retrieved successfully',
        data: response,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
