// Espelha literalmente os DTOs de resposta do backend (agents/04-frontend-fundacao.md,
// confirmado contra backend/src/{auth,users,courses,jobs}). Não reinterpretar nomes de campo.

export enum Role {
  ADMIN = 'admin',
  STUDENT = 'student',
}

export enum ContractType {
  CLT = 'CLT',
  PJ = 'PJ',
  ESTAGIO = 'Estágio',
  OUTRO = 'Outro',
}

export enum WorkModel {
  PRESENCIAL = 'Presencial',
  HIBRIDO = 'Híbrido',
  REMOTO = 'Remoto',
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  course?: string;
  period?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseResponseDto {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobCourseSummary {
  id: string;
  name?: string;
}

export interface JobResponseDto {
  id: string;
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
  courses: JobCourseSummary[];
  requiredPeriod?: number;
  specialties: string[];
  isActive: boolean;
  publishedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: UserResponseDto;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  course: string;
  period: number;
}

export enum StudentStatusFilter {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface CreateCourseRequestDto {
  name: string;
}

export interface UpdateCourseRequestDto {
  name?: string;
  isActive?: boolean;
}

export interface CreateJobRequestDto {
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
  courses: string[];
  requiredPeriod?: number;
  specialties?: string[];
}

export interface UpdateJobRequestDto extends Partial<CreateJobRequestDto> {
  isActive?: boolean;
}
