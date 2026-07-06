import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

export enum StudentStatusFilter {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class ListStudentsQueryDto {
  @IsOptional()
  @IsEnum(StudentStatusFilter)
  status?: StudentStatusFilter;

  @IsOptional()
  @IsMongoId()
  course?: string;
}
