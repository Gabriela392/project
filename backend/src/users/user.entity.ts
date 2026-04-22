import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToMany, JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { Notification } from '../notifications/notification.entity';

export type UserRole = 'ADMIN' | 'USER';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: 'USER' })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Product, (p) => p.owner)
  products: Product[];

  @OneToMany(() => Category, (c) => c.owner)
  categories: Category[];

  @ManyToMany(() => Product, (p) => p.favoritedBy)
  @JoinTable({ name: 'favorites' })
  favorites: Product[];

  @OneToMany(() => AuditLog, (a) => a.actor)
  auditLogs: AuditLog[];

  @OneToMany(() => Notification, (n) => n.receiver)
  notifications: Notification[];

  @OneToMany(() => Notification, (n) => n.sender)
  sentNotifications: Notification[];
}
