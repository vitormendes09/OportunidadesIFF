import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';

interface MongoDuplicateKeyError {
  code: number;
}

function isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  sanitize(course: CourseDocument): CourseResponseDto {
    return plainToInstance(CourseResponseDto, course.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateCourseDto): Promise<CourseDocument> {
    try {
      const created = new this.courseModel({ name: dto.name });
      return await created.save();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(
          `Já existe um curso com o nome "${dto.name}".`,
        );
      }
      throw error;
    }
  }

  async findAll(includeInactive: boolean): Promise<CourseDocument[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.courseModel.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<CourseDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Curso não encontrado.');
    }
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException('Curso não encontrado.');
    }
    return course;
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseDocument> {
    const course = await this.findById(id);

    if (dto.name !== undefined) course.name = dto.name;
    if (dto.isActive !== undefined) course.isActive = dto.isActive;

    try {
      return await course.save();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(
          `Já existe um curso com o nome "${dto.name}".`,
        );
      }
      throw error;
    }
  }

  async softDelete(id: string): Promise<CourseDocument> {
    const course = await this.findById(id);

    // TODO: antes de desativar, verificar se há Students (User.course) ou Jobs
    // (Job.courses) vinculados a este curso. Não reforçado nesta etapa (Etapa 02)
    // por decisão registrada em agents/02-cursos.md — reforçar quando necessário.
    course.isActive = false;
    return course.save();
  }
}
