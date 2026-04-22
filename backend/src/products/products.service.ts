import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @InjectRepository(Category) private readonly catRepo: Repository<Category>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly auditService: AuditService,
    private readonly notifService: NotificationsService,
  ) {}

  private async resolveCategories(ids?: string[]): Promise<Category[]> {
    if (!ids || ids.length === 0) return [];
    return this.catRepo.findBy({ id: In(ids) });
  }

  async create(dto: CreateProductDto, actor: User): Promise<Product> {
    const categories = await this.resolveCategories(dto.categoryIds);
    const product = this.repo.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock ?? 0,
      ownerId: actor.id,
      owner: actor,
      categories,
    });
    const saved = await this.repo.save(product);
    await this.auditService.log({
      action: 'CREATE', entity: 'Product', entityId: saved.id,
      newData: { name: saved.name, price: saved.price },
      actorId: actor.id, actorEmail: actor.email,
    });
    return saved;
  }

  async findAll(query: {
    page?: number; limit?: number; search?: string;
    categoryId?: string; ownerId?: string; minPrice?: number; maxPrice?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.owner', 'owner')
      .leftJoinAndSelect('p.categories', 'categories')
      .orderBy('p.createdAt', 'DESC')
      .skip(skip).take(limit);

    if (query.search) qb.andWhere('p.name ILIKE :s', { s: `%${query.search}%` });
    if (query.ownerId) qb.andWhere('p.ownerId = :ownerId', { ownerId: query.ownerId });
    if (query.categoryId) qb.andWhere('categories.id = :catId', { catId: query.categoryId });
    if (query.minPrice) qb.andWhere('p.price >= :min', { min: query.minPrice });
    if (query.maxPrice) qb.andWhere('p.price <= :max', { max: query.maxPrice });

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['owner', 'categories'],
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async update(id: string, dto: UpdateProductDto, actor: User): Promise<Product> {
    const product = await this.findOne(id);
    const oldData = { name: product.name, price: product.price };

    if (product.ownerId !== actor.id) {
      await this.notifService.create({
        title: 'Seu produto foi editado',
        message: `O usuário ${actor.email} editou o produto "${product.name}"`,
        receiverId: product.ownerId,
        senderId: actor.id,
        entity: 'Product', entityId: id,
      });
    }

    if (dto.categoryIds !== undefined) {
      product.categories = await this.resolveCategories(dto.categoryIds);
    }

    const { categoryIds, ...rest } = dto;
    Object.assign(product, rest);
    const saved = await this.repo.save(product);

    await this.auditService.log({
      action: 'UPDATE', entity: 'Product', entityId: id,
      oldData, newData: rest, actorId: actor.id, actorEmail: actor.email,
    });
    return saved;
  }

  async remove(id: string, actor: User): Promise<void> {
    const product = await this.findOne(id);

    if (product.ownerId !== actor.id) {
      await this.notifService.create({
        title: 'Seu produto foi excluído',
        message: `O usuário ${actor.email} excluiu o produto "${product.name}"`,
        receiverId: product.ownerId,
        senderId: actor.id,
        entity: 'Product', entityId: id,
      });
    }

    await this.repo.remove(product);
    await this.auditService.log({
      action: 'DELETE', entity: 'Product', entityId: id,
      oldData: { name: product.name }, actorId: actor.id, actorEmail: actor.email,
    });
  }

  async updateImage(id: string, filename: string): Promise<Product> {
    const product = await this.findOne(id);
    product.image = `products/${filename}`;
    return this.repo.save(product);
  }

  async toggleFavorite(productId: string, userId: string): Promise<{ favorited: boolean }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const product = await this.findOne(productId);

    const isFav = user.favorites.some((p) => p.id === productId);
    if (isFav) {
      user.favorites = user.favorites.filter((p) => p.id !== productId);
    } else {
      user.favorites.push(product);
    }
    await this.userRepo.save(user);
    return { favorited: !isFav };
  }

  async getFavorites(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites', 'favorites.categories'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user.favorites;
  }

  async getStats() {
    const total = await this.repo.count();
    const result = await this.repo
      .createQueryBuilder('p')
      .select('SUM(p.stock)', 'totalStock')
      .addSelect('AVG(p.price)', 'avgPrice')
      .getRawOne();
    return { total, totalStock: Number(result.totalStock) || 0, avgPrice: Number(result.avgPrice) || 0 };
  }
}
