import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Criar categoria' })
  @Post()
  create(@Body() dto: CreateCategoryDto, @Req() req: any) {
    return this.categoriesService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Listar categorias' })
  @Get()
  findAll(@Query() query: any) {
    return this.categoriesService.findAll(query);
  }

  @ApiOperation({ summary: 'Estatísticas de categorias' })
  @Get('stats')
  getStats() {
    return this.categoriesService.getStats();
  }

  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar categoria' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() req: any) {
    return this.categoriesService.update(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Remover categoria' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.remove(id, req.user);
  }
}
