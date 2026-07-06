import { Exclude, Expose, Transform } from 'class-transformer';
import { Role } from '../enums/role.enum';
import type { UserDocument } from '../schemas/user.schema';

@Exclude()
export class UserResponseDto {
  @Expose()
  @Transform(({ obj }: { obj: UserDocument }) => obj._id?.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: Role;

  @Expose()
  isActive: boolean;

  @Expose()
  isEmailVerified: boolean;

  @Expose()
  @Transform(({ obj }: { obj: UserDocument }) => obj.course?.toString())
  course?: string;

  @Expose()
  period?: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
