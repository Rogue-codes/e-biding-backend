import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { LoginAdminDto } from 'src/admin/dto/login.admin.dto';
import { Admin } from 'src/entities/admin.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/entities/user.entity';
import { ForgotPasswordDTO } from './dto/forgot.password.dto';
import { genToken } from 'src/helpers/genRandomPassword';

export interface IAuthResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  access_token: string;
}

export interface IAuthUserResponse {
  user: User;
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async adminLogin(payload: LoginAdminDto): Promise<IAuthResponse> {
    const admin = await this.adminService.findAdmin(payload.email);

    if (!admin || !(await bcrypt.compare(payload.password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.jwtService.signAsync({
      id: admin.id,
      email: admin.email,
      isAdmin: admin.isAdmin,
    });
    delete admin.password;

    return {
      ...admin,
      access_token,
    };
  }

  async userLogin(payload: LoginAdminDto): Promise<IAuthUserResponse> {
    const user = await this.userService.findOne(payload.email);

    if (!user || !(await bcrypt.compare(payload.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      isVerified: user.isVerified,
    });

    delete user.password;

    return {
      user,
      access_token,
    };
  }

  async forgotPassword(payload: ForgotPasswordDTO): Promise<string> {
    const user = await this.userService.findOne(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = genToken();
    const hashedToken = await bcrypt.hash(token, 10);

    this.userService.generateOTP(user, hashedToken);

    return `token has been generated and sent to ${user.email}`;
  }
}
