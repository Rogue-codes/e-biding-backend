import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class OTP {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  userId: number;

  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  tokenExpiresIn: Date;

  @CreateDateColumn()
  createdAt: Date;

  constructor(userId: number, token: string) {
    this.userId = userId;
    this.token = token;
    this.tokenExpiresIn = new Date(Date.now() + 3600000); // Expires in 1 hour
  }
}
