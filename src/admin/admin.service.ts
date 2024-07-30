import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { Repository } from 'typeorm';
import { CreateAdminDto } from './dto/create.admin.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: {
        email: createAdminDto.email,
      },
    });
    if (admin) {
      throw new HttpException('Admin already exists', 403);
    }
    const hashedPassword = await bcrypt.hashSync(createAdminDto.password, 10);
    const newAdmin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,
    });
    await this.adminRepository.save(newAdmin);
    delete newAdmin.password;
    return newAdmin;
  }

  async findAdmin(email: string) {
    const admin = await this.adminRepository.findOne({
      where: {
        email,
      },
    });

    if (!admin) {
      throw new NotFoundException('User not found');
    }

    return admin;
  }
}
