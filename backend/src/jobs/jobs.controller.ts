import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/enums/role.enum';
import type { UserDocument } from '../users/schemas/user.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(
    @Body() dto: CreateJobDto,
    @CurrentUser() admin: UserDocument,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.create(
      dto,
      (admin._id as { toString(): string }).toString(),
    );
    return this.jobsService.sanitize(job);
  }

  @Get()
  async findAll(@Query() query: ListJobsQueryDto): Promise<JobResponseDto[]> {
    const jobs = await this.jobsService.findAllForStudent(query);
    return jobs.map((job) => this.jobsService.sanitize(job));
  }

  // Precisa vir antes de "GET /jobs/:id" para não colidir com o parâmetro dinâmico.
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  async findAllForAdmin(): Promise<JobResponseDto[]> {
    const jobs = await this.jobsService.findAllForAdmin();
    return jobs.map((job) => this.jobsService.sanitize(job));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobResponseDto> {
    const job = await this.jobsService.findById(id);
    return this.jobsService.sanitize(job);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.update(id, dto);
    return this.jobsService.sanitize(job);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<JobResponseDto> {
    const job = await this.jobsService.softDelete(id);
    return this.jobsService.sanitize(job);
  }
}
