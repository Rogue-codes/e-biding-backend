import { Body, Controller, Post, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create.admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  async createAdmin(@Body() admin: CreateAdminDto, @Res() res) {
    try {
      const admin_ = await this.adminService.createAdmin(admin);
      return res.status(200).json({
        success: true,
        message: 'admin created successfully',
        data: admin_,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
