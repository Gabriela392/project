import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, FindOptionsWhere } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "./user.entity";
import { CreateUserDto, UpdateUserDto, PaginationQueryDto } from "./users.dto";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateUserDto, actor: User): Promise<User> {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException("E-mail já cadastrado");

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: (dto.role as any) ?? "USER",
    });
    const saved = (await this.repo.save(user)) as User;

    await this.auditService.log({
      action: "CREATE",
      entity: "User",
      entityId: saved.id,
      newData: { email: saved.email, role: saved.role },
      actorId: actor.id,
      actorEmail: actor.email,
    });

    return saved;
  }

  async findAll(query: PaginationQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<User>[] = [];
    if (query.search) {
      where.push({ name: ILike(`%${query.search}%`) });
      where.push({ email: ILike(`%${query.search}%`) });
    }
    if (query.role && !query.search) {
      where.push({ role: query.role as any });
    }

    const [data, total] = await this.repo.findAndCount({
      where: where.length ? where : undefined,
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return user;
  }

  async update(id: string, dto: UpdateUserDto, actor: User): Promise<User> {
    const user = await this.findOne(id);
    const oldData = { name: user.name, email: user.email, role: user.role };

    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    if (dto.email && dto.email !== user.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException("E-mail já cadastrado");
    }

    Object.assign(user, dto);
    const saved = await this.repo.save(user);

    await this.auditService.log({
      action: "UPDATE",
      entity: "User",
      entityId: id,
      oldData,
      newData: { name: saved.name, email: saved.email, role: saved.role },
      actorId: actor.id,
      actorEmail: actor.email,
    });

    return saved;
  }

  async remove(id: string, actor: User): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
    await this.auditService.log({
      action: "DELETE",
      entity: "User",
      entityId: id,
      oldData: { email: user.email },
      actorId: actor.id,
      actorEmail: actor.email,
    });
  }

  async updateAvatar(id: string, filename: string): Promise<User> {
    const user = await this.findOne(id);
    user.avatar = filename;
    return this.repo.save(user);
  }

  async getStats() {
    const total = await this.repo.count();
    const admins = await this.repo.count({ where: { role: "ADMIN" } });
    const users = await this.repo.count({ where: { role: "USER" } });
    return { total, admins, users };
  }
}
