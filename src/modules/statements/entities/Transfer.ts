import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';


import { User } from '../../users/entities/User';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  transfer_id: string;

  @Column('uuid')
  id?: string;

  @Column('uuid')
  sender_id: string;

  @ManyToOne(() => User, user => user.statement)
  @JoinColumn({ name: 'id' })
  user: User;

  @ManyToOne(() => User, user => user.statement)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column()
  description: string;

  @Column('decimal', { precision: 5, scale: 2 })
  amount: number;

  @Column({default: "transfer"})
  type: string;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;

  constructor() {
    if (!this.transfer_id) {
      this.transfer_id = uuid();
    }
  }
}
