import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, ILike } from 'typeorm';
import { AuditLog } from './audit-log.entity';

interface LogParams {
  action: string;
  entity: string;
  entityId?: string;
  oldData?: any;
  newData?: any;
  actorId: string;
  actorEmail: string;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(params: LogParams): Promise<AuditLog> {
    const entry = this.repo.create(params);
    return this.repo.save(entry);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    actorEmail?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<AuditLog> = {};
    if (query.action) where.action = query.action;
    if (query.entity) where.entity = query.entity;
    if (query.actorEmail) where.actorEmail = ILike(`%${query.actorEmail}%`);
    if (query.startDate && query.endDate) {
      where.createdAt = Between(new Date(query.startDate), new Date(query.endDate));
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async getStats() {
    const total = await this.repo.count();
    const byAction = await this.repo
      .createQueryBuilder('a')
      .select('a.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.action')
      .getRawMany();

    const byEntity = await this.repo
      .createQueryBuilder('a')
      .select('a.entity', 'entity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.entity')
      .getRawMany();

    const recent = await this.repo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return { total, byAction, byEntity, recent };
  }
}
