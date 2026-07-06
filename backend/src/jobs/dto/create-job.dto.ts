import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
} from 'class-validator';
import { ContractType } from '../enums/contract-type.enum';
import { WorkModel } from '../enums/work-model.enum';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ContractType)
  contractType: ContractType;

  @IsEnum(WorkModel)
  workModel: WorkModel;

  @IsString()
  @IsNotEmpty()
  companyLocation: string;

  @IsString()
  @IsNotEmpty()
  workLocation: string;

  @IsBoolean()
  hasBenefits: boolean;

  // RN16-23: obrigatório apenas quando hasBenefits === true.
  @ValidateIf((dto: CreateJobDto) => dto.hasBenefits === true)
  @IsString()
  @IsNotEmpty()
  benefitsDescription?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsUrl()
  applicationUrl: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  courses: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  requiredPeriod?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];
}
