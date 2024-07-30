import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
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
}
