import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
}
