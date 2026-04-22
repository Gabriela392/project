import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  Query, UseGuards, Req, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Criar produto' })
  @Post()
  create(@Body() dto: CreateProductDto, @Req() req: any) {
    return this.productsService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'Listar produtos com filtros e paginação' })
  @Get()
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @ApiOperation({ summary: 'Estatísticas de produtos' })
  @Get('stats')
  getStats() {
    return this.productsService.getStats();
  }

  @ApiOperation({ summary: 'Listar favoritos do usuário logado' })
  @Get('favorites')
  getFavorites(@Req() req: any) {
    return this.productsService.getFavorites(req.user.id);
  }

  @ApiOperation({ summary: 'Favoritar/desfavoritar produto' })
  @Post(':id/favorite')
  toggleFavorite(@Param('id') id: string, @Req() req: any) {
    return this.productsService.toggleFavorite(id, req.user.id);
  }

  @ApiOperation({ summary: 'Buscar produto por ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar produto' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: any) {
    return this.productsService.update(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Remover produto' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productsService.remove(id, req.user);
  }

  @ApiOperation({ summary: 'Upload de imagem do produto' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (_, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
      }),
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/))
          return cb(new Error('Apenas imagens permitidas'), false);
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @Post(':id/image')
  uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.productsService.updateImage(id, file.filename);
  }
}
