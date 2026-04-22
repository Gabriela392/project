import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

interface CreateNotifParams {
  title: string;
  message: string;
  receiverId: string;
  senderId?: string;
  entity?: string;
  entityId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly repo: Repository<Notification>,
  ) {}

  async create(params: CreateNotifParams): Promise<Notification> {
    const notif = this.repo.create(params);
    return this.repo.save(notif);
  }

  async findForUser(userId: string, query: { page?: number; limit?: number; unread?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('n')
      .where('n.receiverId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .skip(skip).take(limit);

    if (query.unread === 'true') qb.andWhere('n.read = false');

    const [data, total] = await qb.getManyAndCount();
    const unreadCount = await this.repo.count({ where: { receiverId: userId, read: false } });
    return { data, meta: { total, page, limit, lastPage: Math.ceil(total / limit) }, unreadCount };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notif = await this.repo.findOne({ where: { id, receiverId: userId } });
    if (!notif) throw new Error('Notificação não encontrada');
    notif.read = true;
    return this.repo.save(notif);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ receiverId: userId, read: false }, { read: true });
  }
}
