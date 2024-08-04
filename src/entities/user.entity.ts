import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ length: 100 })
  companyName: string;

  @Column({ length: 200 })
  companyAddress: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  alternatePhone: string;

  @Column({ unique: true })
  RCNumber: string;

  @Column()
  postalCode: number;

  @Column({ unique: true })
  email: string;

  @Column()
  CACDoc: string;

  @Column()
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
