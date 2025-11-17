import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Patch,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProviderApplicationsService } from './provider-applications.service';
import { CreateProviderApplicationDto } from './dto/create-provider-application.dto';
import { UpdateProviderApplicationStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { mkdirSync } from 'fs';

@Controller('provider-applications')
export class ProviderApplicationsController {
  constructor(private readonly service: ProviderApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(
            process.cwd(),
            'uploads',
            'provider-documents',
          );
          mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async apply(
    @Req() req: any,
    @Body() dto: CreateProviderApplicationDto,
    @UploadedFile() document?: any,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const documentUrl = document
      ? `/uploads/provider-documents/${document.filename}`
      : '';
    return this.service.create(userId, dto, documentUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myLatest(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.service.findMyLatest(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async list(@Query('status') status?: string) {
    return this.service.list(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProviderApplicationStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status);
  }
}
