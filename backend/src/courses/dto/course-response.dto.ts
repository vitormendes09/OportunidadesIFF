import { Exclude, Expose, Transform } from 'class-transformer';
import type { CourseDocument } from '../schemas/course.schema';

@Exclude()
export class CourseResponseDto {
  @Expose()
  @Transform(({ obj }: { obj: CourseDocument }) => obj._id?.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
