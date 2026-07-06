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

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsOptional()
  @IsEnum(WorkModel)
  workModel?: WorkModel;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companyLocation?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  workLocation?: string;

  @IsOptional()
  @IsBoolean()
  hasBenefits?: boolean;

  // Validação de consistência final (considerando o documento já salvo, não só
  // este payload) é reforçada no JobsService — aqui cobrimos o caso óbvio de
  // o próprio payload já ligar hasBenefits sem descrição.
  @ValidateIf((dto: UpdateJobDto) => dto.hasBenefits === true)
  @IsString()
  @IsNotEmpty()
  benefitsDescription?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsUrl()
  applicationUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  courses?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  requiredPeriod?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
