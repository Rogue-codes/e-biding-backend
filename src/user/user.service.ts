import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/email/email.service';
import { genToken } from 'src/helpers/genRandomPassword';
import { OTP } from 'src/entities/OTP.entity';
import { verifyEmailDto } from './dto/verifyEmail.dto';
import { UpdateUserDto } from './dto/update.user.dto';

interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(OTP)
    private readonly OTPRepository: Repository<OTP>,
    private readonly mailService: MailService,
  ) {}

  async findOne(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email: email as string,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async isUserActive(email: string): Promise<boolean> {
    try {
      const user = await this.findOne(email);
      if (!user.isActive) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Error occurred while checking user status',
      );
    }
  }

  async createUser(user: CreateUserDto) {
    const token = genToken();
    // Check if email already exists
    let existingUser: User;
    try {
      existingUser = await this.findOne(user.email);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    if (existingUser) {
      throw new HttpException(
        `User with email:${user.email} already exists`,
        400,
      );
    }

    const checkExistence = async (field: keyof CreateUserDto, value: any) => {
      const existingEntry = await this.userRepository.findOne({
        where: { [field]: value },
      });
      if (existingEntry) {
        throw new HttpException(
          `User with ${field}: ${value} already exists`,
          400,
        );
      }
    };

    // Check existence for multiple fields
    await Promise.all([
      checkExistence('phone', user.phone),
      checkExistence('alternatePhone', user.alternatePhone),
      checkExistence('RCNumber', user.RCNumber),
    ]);

    const hashedPassword = bcrypt.hashSync(user.password, 10);

    const newUser = this.userRepository.create({
      ...user,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    const hashedToken = bcrypt.hashSync(token, 10);
    await this.generateOTP(newUser, hashedToken, token);

    delete newUser.password;
    return newUser;
  }

  async approveUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isActive) {
      throw new HttpException('User is already active', 400);
    }

    user.isActive = true;

    try {
      const updatedUser = await this.userRepository.save(user);
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      throw new Error('Error updating user status or sending email');
    }
  }

  async rejectUser(id: number): Promise<String> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isActive) {
      throw new HttpException('User is already active', 400);
    }

    try {
      const deletedUser = await this.userRepository.delete(user.id);

      this.mailService.sendRejectedRequestMail(user);

      return 'User request REJECTED Successfully';
    } catch (error) {
      throw new Error('Error updating user status or sending email');
    }
  }

  async generateOTP(user: User, hashedToken: string, token: string) {
    try {
      // check if otp exist for the user
      const alreadyExistingOtp = await this.OTPRepository.findOne({
        where: {
          userId: user.id,
        },
      });

      if (!alreadyExistingOtp) {
        await this.OTPRepository.save({
          userId: user.id,
          token: hashedToken,
          tokenExpiresIn: new Date(Date.now() + 3600000), // Expires in 1 hour
        });
      } else {
        Object.assign(alreadyExistingOtp, {
          userId: user.id,
          token: hashedToken,
          tokenExpiresIn: new Date(Date.now() + 3600000), // Expires in 1 hour
        });

        await this.OTPRepository.save(alreadyExistingOtp);
      }

      this.mailService.sendverifyEmail(user, token);
    } catch (error) {
      // Handle potential errors during OTP generation or email sending
      console.log(error);
      throw new InternalServerErrorException('Error generating OTP');
    }
  }

  // reset password
  async confirmOtp(email: string, token: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.OTPRepository.findOne({
      where: { userId: user.id },
    });

    if (!otp) {
      throw new NotFoundException('OTP not found');
    }

    const tokenMatch = await bcrypt.compare(token, otp.token);
    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.OTPRepository.delete(otp.Id);
    return true;
  }

  async resendOtp(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedToken = bcrypt.hashSync(genToken(), 10);
    await this.generateOTP(user, hashedToken, genToken());
  }

  // verify account
  async verifyEmail(payload: verifyEmailDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.OTPRepository.findOne({
      where: { userId: user.id },
    });

    if (!otp) {
      throw new NotFoundException('OTP not found');
    }

    const tokenMatch = await bcrypt.compare(payload.token, otp.token);
    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid token');
    }

    if (!user.isVerified) {
      user.isVerified = true;
    }

    await this.OTPRepository.delete(otp.Id);

    try {
      const updatedUser = await this.userRepository.save(user);
      await this.mailService.sendVerificationSuccessMail(updatedUser);

      // Ensure password and other sensitive data are not included in the response
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating user status or sending email',
      );
    }
  }

  async changePassword(id: number, newPassword: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    existingUser.password = hashedPassword;
    try {
      await this.userRepository.save(existingUser);
      return existingUser;
    } catch (error) {
      throw new InternalServerErrorException('Error reseting password');
    }
  }

  async getUsers(
    page: number,
    limit: number,
    search?: string,
    filter?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Search functionality
    if (search) {
      queryBuilder
        .where('user.firstName ILIKE :search', { search: `%${search}%` })
        .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
        .orWhere('user.email ILIKE :search', { search: `%${search}%` })
        .orWhere('user.companyName ILIKE :search', { search: `%${search}%` });
    }

    // Filter functionality
    if (filter === 'active') {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: false });
    }

    // Filter by date functionality
    if (startDate && endDate) {
      queryBuilder.andWhere('user.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('user.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('user.createdAt <= :endDate', { endDate });
    }

    // Pagination
    queryBuilder.skip(page > 0 ? (page - 1) * limit : 0);
    queryBuilder.take(limit || 10);

    // Selecting specific fields
    queryBuilder.select([
      'user.id',
      'user.firstName',
      'user.email',
      'user.lastName',
      'user.CACDoc',
      'user.RCNumber',
      'user.alternatePhone',
      'user.isActive',
      'user.companyAddress',
      'user.companyName',
      'user.phone',
      'user.postalCode',
      'user.isVerified',
      'user.createdAt',
    ]);

    const [data, total] = await queryBuilder.getManyAndCount();

    const lastPage = Math.ceil(total / (limit ? limit : 10));

    return {
      data,
      total,
      page,
      limit,
      lastPage,
    };
  }

  async getUser(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);

    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error updating user');
    }
  }
}
