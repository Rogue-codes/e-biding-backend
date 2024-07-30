import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService, IAuthResponse, IAuthUserResponse } from './auth.service';
import { LoginAdminDto } from 'src/admin/dto/login.admin.dto';
import { ForgotPasswordDTO } from './dto/forgot.password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/admin/login')
  async loginAdmin(
    @Body() payload: LoginAdminDto,
    @Res() res,
  ): Promise<IAuthResponse> {
    try {
      const admin = await this.authService.adminLogin(payload);
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: admin,
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('/user/login')
  async loginUser(
    @Body() payload: LoginAdminDto,
    @Res() res,
  ): Promise<IAuthUserResponse> {
    try {
      const user = await this.authService.userLogin(payload);
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: user,
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() payload: ForgotPasswordDTO, @Res() res) {
    try {
      const response = await this.authService.forgotPassword(payload);
      return res.status(200).json({
        success: true,
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
