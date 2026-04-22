import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { LoginDto } from './auth.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: LoginDto, ip?: string) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });

    await this.auditService.log({
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      actorId: user.id,
      actorEmail: user.email,
      ipAddress: ip,
    });

    const { password, ...result } = user;
    return { access_token: token, user: result };
  }

  async me(userId: string) {
    return this.userRepo.findOne({ where: { id: userId } });
  }
}
