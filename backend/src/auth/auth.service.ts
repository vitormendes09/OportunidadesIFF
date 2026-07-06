import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private isEmailVerificationEnabled(): boolean {
    return (
      this.configService.get<string>('EMAIL_VERIFICATION_ENABLED') === 'true'
    );
  }

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const allowedDomain = this.configService.get<string>(
      'ALLOWED_EMAIL_DOMAIN',
    );

    if (
      !allowedDomain ||
      !dto.email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`)
    ) {
      throw new BadRequestException(
        `Cadastro permitido apenas com e-mail institucional @${allowedDomain}.`,
      );
    }

    await this.usersService.assertEmailAvailable(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const emailVerificationEnabled = this.isEmailVerificationEnabled();
    const emailVerificationToken = emailVerificationEnabled
      ? randomBytes(32).toString('hex')
      : undefined;

    const user = await this.usersService.createStudent({
      name: dto.name,
      email: dto.email,
      passwordHash,
      course: dto.course,
      period: dto.period,
      isEmailVerified: !emailVerificationEnabled,
      emailVerificationToken,
    });

    if (emailVerificationEnabled && emailVerificationToken) {
      await this.mailService.sendVerificationEmail(
        user.email,
        emailVerificationToken,
      );
    }

    return this.usersService.sanitize(user);
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; user: UserResponseDto }> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário desativado.');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (this.isEmailVerificationEnabled() && !user.isEmailVerified) {
      throw new UnauthorizedException('E-mail ainda não verificado.');
    }

    const payload: JwtPayload = { sub: user._id.toString(), role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user: this.usersService.sanitize(user) };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new NotFoundException('Token de verificação inválido ou expirado.');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return { message: 'E-mail verificado com sucesso.' };
  }
}
