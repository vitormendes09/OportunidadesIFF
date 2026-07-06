import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { UpdateMeDto } from './dto/update-me.dto';
import {
  ListStudentsQueryDto,
  StudentStatusFilter,
} from './dto/list-students-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Role } from './enums/role.enum';
import { User, UserDocument } from './schemas/user.schema';

export interface CreateStudentInput {
  name: string;
  email: string;
  passwordHash: string;
  course: string;
  period: number;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  sanitize(user: UserDocument): UserResponseDto {
    return plainToInstance(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .select('+passwordHash')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(id).exec();
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ emailVerificationToken: token })
      .select('+emailVerificationToken')
      .exec();
  }

  async createStudent(input: CreateStudentInput): Promise<UserDocument> {
    const created = new this.userModel({
      name: input.name,
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      role: Role.STUDENT,
      course: new Types.ObjectId(input.course),
      period: input.period,
      isEmailVerified: input.isEmailVerified,
      emailVerificationToken: input.emailVerificationToken,
    });
    return created.save();
  }

  async createAdmin(input: CreateAdminInput): Promise<UserDocument> {
    const created = new this.userModel({
      name: input.name,
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    });
    return created.save();
  }

  async updateMe(user: UserDocument, dto: UpdateMeDto): Promise<UserDocument> {
    if (
      user.role === Role.ADMIN &&
      (dto.course !== undefined || dto.period !== undefined)
    ) {
      throw new BadRequestException('Admin não possui curso ou período.');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.course !== undefined) user.course = new Types.ObjectId(dto.course);
    if (dto.period !== undefined) user.period = dto.period;

    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return user.save();
  }

  async listStudents(query: ListStudentsQueryDto): Promise<UserDocument[]> {
    const filter: Record<string, unknown> = { role: Role.STUDENT };

    if (query.status === StudentStatusFilter.ACTIVE) filter.isActive = true;
    if (query.status === StudentStatusFilter.INACTIVE) filter.isActive = false;
    if (query.course) filter.course = new Types.ObjectId(query.course);

    return this.userModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async deactivateStudent(id: string): Promise<UserDocument> {
    return this.setStudentActiveState(id, false);
  }

  async activateStudent(id: string): Promise<UserDocument> {
    return this.setStudentActiveState(id, true);
  }

  private async setStudentActiveState(
    id: string,
    isActive: boolean,
  ): Promise<UserDocument> {
    const student = await this.userModel
      .findOne({ _id: id, role: Role.STUDENT })
      .exec();
    if (!student) {
      throw new NotFoundException('Student não encontrado.');
    }
    student.isActive = isActive;
    return student.save();
  }

  async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado.');
    }
  }
}
