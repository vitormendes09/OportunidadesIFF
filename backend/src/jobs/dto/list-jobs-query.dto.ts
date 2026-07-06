import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';

export class ListJobsQueryDto {
  @IsOptional()
  @IsMongoId()
  course?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requiredPeriod?: number;

  @IsOptional()
  @IsString()
  specialty?: string;
}
