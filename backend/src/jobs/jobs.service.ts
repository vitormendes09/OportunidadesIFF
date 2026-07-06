import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { CoursesService } from '../courses/courses.service';
import { CourseDocument } from '../courses/schemas/course.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { JobCourseSummary, JobResponseDto } from './dto/job-response.dto';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ContractType } from './enums/contract-type.enum';
import { WorkModel } from './enums/work-model.enum';
import { Job, JobDocument } from './schemas/job.schema';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface JobPlainObject {
  _id: Types.ObjectId;
  title: string;
  companyName: string;
  description: string;
  contractType: ContractType;
  workModel: WorkModel;
  companyLocation: string;
  workLocation: string;
  hasBenefits: boolean;
  benefitsDescription?: string;
  salary?: string;
  applicationUrl: string;
  courses: Array<Types.ObjectId | { _id: Types.ObjectId; name: string }>;
  requiredPeriod?: number;
  specialties: string[];
  isActive: boolean;
  publishedAt: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private readonly coursesService: CoursesService,
  ) {}

  private assertBenefitsConsistency(
    hasBenefits: boolean,
    benefitsDescription?: string,
  ): void {
    if (hasBenefits && !benefitsDescription) {
      throw new BadRequestException(
        'benefitsDescription é obrigatório quando hasBenefits é true.',
      );
    }
  }

  // RN09/escopo Etapa 03: courses só pode referenciar Course existente e ativo.
  private async assertCoursesExistAndActive(
    courseIds: string[],
  ): Promise<Types.ObjectId[]> {
    const objectIds: Types.ObjectId[] = [];

    for (const id of courseIds) {
      let course: CourseDocument;
      try {
        course = await this.coursesService.findById(id);
      } catch {
        throw new BadRequestException(`Curso "${id}" não existe.`);
      }
      if (!course.isActive) {
        throw new BadRequestException(
          `Curso "${course.name}" está inativo e não pode ser vinculado a uma vaga.`,
        );
      }
      objectIds.push(course._id);
    }

    return objectIds;
  }

  async create(dto: CreateJobDto, adminId: string): Promise<JobDocument> {
    this.assertBenefitsConsistency(dto.hasBenefits, dto.benefitsDescription);
    const courseObjectIds = await this.assertCoursesExistAndActive(dto.courses);

    const created = new this.jobModel({
      title: dto.title,
      companyName: dto.companyName,
      description: dto.description,
      contractType: dto.contractType,
      workModel: dto.workModel,
      companyLocation: dto.companyLocation,
      workLocation: dto.workLocation,
      hasBenefits: dto.hasBenefits,
      benefitsDescription: dto.benefitsDescription,
      salary: dto.salary,
      applicationUrl: dto.applicationUrl,
      courses: courseObjectIds,
      requiredPeriod: dto.requiredPeriod,
      specialties: dto.specialties ?? [],
      // RN15/RN21: publishedAt e createdBy nunca vêm do client, sempre calculados aqui.
      publishedAt: new Date(),
      createdBy: new Types.ObjectId(adminId),
    });

    return created.save();
  }

  async findAllForStudent(filters: ListJobsQueryDto): Promise<JobDocument[]> {
    const query: QueryFilter<JobDocument> = { isActive: true };

    if (filters.course) {
      query.courses = new Types.ObjectId(filters.course);
    }

    if (filters.requiredPeriod !== undefined) {
      // Vaga sem requiredPeriod definido é aberta a qualquer período.
      query.$or = [
        { requiredPeriod: { $exists: false } },
        { requiredPeriod: filters.requiredPeriod },
      ];
    }

    if (filters.specialty) {
      query.specialties = {
        $elemMatch: {
          $regex: new RegExp(`^${escapeRegExp(filters.specialty)}$`, 'i'),
        },
      };
    }

    return this.jobModel
      .find(query)
      .sort({ publishedAt: -1 })
      .populate('courses', 'name isActive')
      .exec();
  }

  async findAllForAdmin(): Promise<JobDocument[]> {
    return this.jobModel
      .find({})
      .sort({ publishedAt: -1 })
      .populate('courses', 'name isActive')
      .exec();
  }

  async findById(id: string): Promise<JobDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    const job = await this.jobModel
      .findById(id)
      .populate('courses', 'name isActive')
      .exec();
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    return job;
  }

  private async findRawById(id: string): Promise<JobDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    return job;
  }

  async update(id: string, dto: UpdateJobDto): Promise<JobDocument> {
    const job = await this.findRawById(id);

    if (dto.courses !== undefined) {
      job.courses = await this.assertCoursesExistAndActive(dto.courses);
    }
    if (dto.title !== undefined) job.title = dto.title;
    if (dto.companyName !== undefined) job.companyName = dto.companyName;
    if (dto.description !== undefined) job.description = dto.description;
    if (dto.contractType !== undefined) job.contractType = dto.contractType;
    if (dto.workModel !== undefined) job.workModel = dto.workModel;
    if (dto.companyLocation !== undefined)
      job.companyLocation = dto.companyLocation;
    if (dto.workLocation !== undefined) job.workLocation = dto.workLocation;
    if (dto.hasBenefits !== undefined) job.hasBenefits = dto.hasBenefits;
    if (dto.benefitsDescription !== undefined)
      job.benefitsDescription = dto.benefitsDescription;
    if (dto.salary !== undefined) job.salary = dto.salary;
    if (dto.applicationUrl !== undefined)
      job.applicationUrl = dto.applicationUrl;
    if (dto.requiredPeriod !== undefined)
      job.requiredPeriod = dto.requiredPeriod;
    if (dto.specialties !== undefined) job.specialties = dto.specialties;
    if (dto.isActive !== undefined) job.isActive = dto.isActive;

    // Reforço final considerando o estado já mesclado do documento, não só o payload.
    this.assertBenefitsConsistency(job.hasBenefits, job.benefitsDescription);

    await job.save();
    return this.findById(id);
  }

  async softDelete(id: string): Promise<JobDocument> {
    const job = await this.findRawById(id);
    // RN22: nenhuma expiração automática — isso só acontece por ação manual do Admin.
    job.isActive = false;
    await job.save();
    return this.findById(id);
  }

  sanitize(job: JobDocument): JobResponseDto {
    const obj = job.toObject() as JobPlainObject;

    const courses: JobCourseSummary[] = obj.courses.map((courseRef) => {
      if (courseRef instanceof Types.ObjectId) {
        return { id: courseRef.toString() };
      }
      return { id: courseRef._id.toString(), name: courseRef.name };
    });

    return {
      id: obj._id.toString(),
      title: obj.title,
      companyName: obj.companyName,
      description: obj.description,
      contractType: obj.contractType,
      workModel: obj.workModel,
      companyLocation: obj.companyLocation,
      workLocation: obj.workLocation,
      hasBenefits: obj.hasBenefits,
      benefitsDescription: obj.benefitsDescription,
      salary: obj.salary,
      applicationUrl: obj.applicationUrl,
      courses,
      requiredPeriod: obj.requiredPeriod,
      specialties: obj.specialties,
      isActive: obj.isActive,
      publishedAt: obj.publishedAt,
      createdBy: obj.createdBy.toString(),
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
}
