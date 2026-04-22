import { Controller, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @ApiOperation({ summary: 'Listar notificações do usuário logado' })
  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    return this.notifService.findForUser(req.user.id, query);
  }

  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notifService.markAsRead(id, req.user.id);
  }

  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notifService.markAllAsRead(req.user.id);
  }
}
