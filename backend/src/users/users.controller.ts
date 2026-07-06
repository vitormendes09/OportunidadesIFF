import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Role } from './enums/role.enum';
import type { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: UserDocument): UserResponseDto {
    return this.usersService.sanitize(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateMeDto,
  ): Promise<UserResponseDto> {
    const updated = await this.usersService.updateMe(user, dto);
    return this.usersService.sanitize(updated);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('students')
  async listStudents(@Query() query: ListStudentsQueryDto): Promise<UserResponseDto[]> {
    const students = await this.usersService.listStudents(query);
    return students.map((student) => this.usersService.sanitize(student));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('students/:id/deactivate')
  async deactivate(@Param('id') id: string): Promise<UserResponseDto> {
    const student = await this.usersService.deactivateStudent(id);
    return this.usersService.sanitize(student);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('students/:id/activate')
  async activate(@Param('id') id: string): Promise<UserResponseDto> {
    const student = await this.usersService.activateStudent(id);
    return this.usersService.sanitize(student);
  }
}
