import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { User } from '../users/user.entity';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly repo: Repository<Category>,
    private readonly auditService: AuditService,
    private readonly notifService: NotificationsService,
  ) {}

  async create(dto: CreateCategoryDto, actor: User): Promise<Category> {
    const cat = this.repo.create({ ...dto, ownerId: actor.id, owner: actor });
    const saved = await this.repo.save(cat);
    await this.auditService.log({
      action: 'CREATE', entity: 'Category', entityId: saved.id,
      newData: dto, actorId: actor.id, actorEmail: actor.email,
    });
    return saved;
  }

  async findAll(query: { page?: number; limit?: number; search?: string; ownerId?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.owner', 'owner')
      .orderBy('c.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.search) qb.andWhere('c.name ILIKE :s', { s: `%${query.search}%` });
    if (query.ownerId) qb.andWhere('c.ownerId = :ownerId', { ownerId: query.ownerId });

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Category> {
    const cat = await this.repo.findOne({ where: { id }, relations: ['owner', 'products'] });
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto, actor: User): Promise<Category> {
    const cat = await this.findOne(id);
    const oldData = { name: cat.name, description: cat.description };

    // Notify owner if a different user is editing
    if (cat.ownerId !== actor.id) {
      await this.notifService.create({
        title: 'Sua categoria foi editada',
        message: `O usuário ${actor.email} editou a categoria "${cat.name}"`,
        receiverId: cat.ownerId,
        senderId: actor.id,
        entity: 'Category',
        entityId: id,
      });
    }

    Object.assign(cat, dto);
    const saved = await this.repo.save(cat);
    await this.auditService.log({
      action: 'UPDATE', entity: 'Category', entityId: id,
      oldData, newData: dto, actorId: actor.id, actorEmail: actor.email,
    });
    return saved;
  }

  async remove(id: string, actor: User): Promise<void> {
    const cat = await this.findOne(id);

    if (cat.ownerId !== actor.id) {
      await this.notifService.create({
        title: 'Sua categoria foi excluída',
        message: `O usuário ${actor.email} excluiu a categoria "${cat.name}"`,
        receiverId: cat.ownerId,
        senderId: actor.id,
        entity: 'Category',
        entityId: id,
      });
    }

    await this.repo.remove(cat);
    await this.auditService.log({
      action: 'DELETE', entity: 'Category', entityId: id,
      oldData: { name: cat.name }, actorId: actor.id, actorEmail: actor.email,
    });
  }

  async getStats() {
    const total = await this.repo.count();
    return { total };
  }
}
