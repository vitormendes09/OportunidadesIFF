import { ContractType } from '../enums/contract-type.enum';
import { WorkModel } from '../enums/work-model.enum';

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
  publishedAt: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
