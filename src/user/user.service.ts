import { HttpException, Injectable, NotFoundException, Patch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcryptjs';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MailService } from 'src/email/email.service';
import { genToken } from 'src/helpers/genRandomPassword';
import { OTP } from 'src/entities/OTP.entity';
import { verifyEmailDto } from './dto/verifyEmail.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(OTP)
    private readonly OTPRepository: Repository<OTP>,

    private readonly cloudinaryService: CloudinaryService,
    private readonly mailService: MailService,
  ) {}

  async findOne(email: string | number): Promise<User> {
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

  async createUser(user: CreateUserDto, file: any) {
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

    const uploadResult = await this.cloudinaryService.uploadFile(file);

    const hashedPassword = bcrypt.hashSync(user.password, 10);

    const newUser = this.userRepository.create({
      ...user,
      password: hashedPassword,
      CACDoc: uploadResult.secure_url,
    });

    await this.userRepository.save(newUser);

    delete newUser.password;
    return newUser;
  }

  async approveUser(id: number): Promise<User> {
    const token = genToken();
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isActive) {
      throw new HttpException('User is already active', 400);
    }

    user.isActive = true;

    try {
      const updatedUser = await this.userRepository.save(user);

      const hashedToken = bcrypt.hashSync(token, 10);
      await this.OTPRepository.save({
        userId: updatedUser.id,
        token: hashedToken,
        tokenExpiresIn: new Date(Date.now() + 3600000), // Expires in 1 hour
      });

      this.mailService.sendverifyEmail(updatedUser, token);
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      throw new Error('Error updating user status or sending email');
    }
  }
  async verifyEmail(payload: verifyEmailDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: parseInt(payload.userId) },
    });
    const otp = await this.OTPRepository.findOne({
      where: {
        userId: parseInt(payload.userId),
      },
    });

    if (!user || !otp) {
      throw new NotFoundException('user not found');
    }

    const tokenMatch = await bcrypt.compare(payload.token, otp.token);
    if (!tokenMatch) {
      throw new HttpException('Invalid token', 401);
    }

    user.isVerified = true;

    try {
      const updatedUser = await this.userRepository.save(user);

      this.mailService.sendVerificationSuccessMail(updatedUser);
      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      throw new Error('Error updating user status or sending email');
    }
  }
}
