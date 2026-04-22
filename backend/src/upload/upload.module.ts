import { Module } from '@nestjs/common';

// Upload é tratado diretamente nos controllers de Users e Products
// via @UseInterceptors(FileInterceptor). Este módulo existe
// para centralizar configurações globais de upload se necessário.
@Module({})
export class UploadModule {}
