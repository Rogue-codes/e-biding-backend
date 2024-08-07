import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  bidId: string;

  @Column({ length: 1000 })
  bidDescription: string;

  @Column({ length: 1000 })
  itemDescription: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  startingAmount: number;

  @Column('text', { array: true })
  bidRequirements: string[];

  @Column('text', { array: true })
  categories: string[];

  @Column({ unique: true })
  itemImg: string;

  @CreateDateColumn()
  startDate: string;

  @Column()
  endDate: string;
}
