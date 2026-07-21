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
import { CoursesService } from './courses.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { ListCoursesQueryDto } from './dto/list-courses-query.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = await this.coursesService.create(dto);
    return this.coursesService.sanitize(course);
  }

  // Sem guard de propósito: a tela pública de /register precisa listar cursos
  // antes de o Student ter qualquer token (ver agents/CLAUDE.md seção 8/decisões).
  // Nome de curso não é dado sensível. `includeInactive` só tem efeito para Admin
  // autenticado — anônimo/Student sempre recebe apenas cursos ativos.
  @Get()
  async findAll(
    @Query() query: ListCoursesQueryDto,
    @CurrentUser() user: UserDocument | undefined,
  ): Promise<CourseResponseDto[]> {
    const includeInactive =
      user?.role === Role.ADMIN && query.includeInactive === true;
    const courses = await this.coursesService.findAll(includeInactive);
    return courses.map((course) => this.coursesService.sanitize(course));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.findById(id);
    return this.coursesService.sanitize(course);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.coursesService.update(id, dto);
    return this.coursesService.sanitize(course);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.softDelete(id);
    return this.coursesService.sanitize(course);
  }
}
