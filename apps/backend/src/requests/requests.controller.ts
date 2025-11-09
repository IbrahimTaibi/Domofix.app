import { Controller, Post, Patch, Body, Param, UseGuards, Req, UseInterceptors, UploadedFiles, Get, Query } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ApplyForRequestDto } from './dto/apply-for-request.dto';
import { AcceptProviderDto } from './dto/accept-provider.dto';
import { ListRequestsQueryDto } from './dto/list-requests.query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { mkdirSync } from 'fs';

@Controller('requests')
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post()
  async create(@Req() req: any, @Body() dto: CreateRequestDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.service.createRequest(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('provider')
  @Post(':id/apply')
  async apply(@Req() req: any, @Param('id') id: string, @Body() dto: ApplyForRequestDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.service.applyForRequest(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post(':id/accept')
  async acceptProvider(@Req() req: any, @Param('id') id: string, @Body() dto: AcceptProviderDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.service.acceptProvider(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  async complete(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.service.completeRequest(userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Post(':id/photos')
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'request-photos');
          mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        // Allow only images
        if (/^image\//.test(file.mimetype)) cb(null, true);
        else cb(null, false);
      },
    })
  )
  async uploadPhotos(@Req() req: any, @Param('id') id: string, @UploadedFiles() files: any[]) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    const urls = (files || []).map((f) => `/uploads/request-photos/${f.filename}`);
    return this.service.addRequestPhotos(userId, id, urls);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Get()
  async list(@Req() req: any, @Query() query: ListRequestsQueryDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.service.listForCustomer(userId, {
      status: query.status,
      offset: query.offset,
      limit: query.limit,
    });
  }
}