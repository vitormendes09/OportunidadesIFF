import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';

const logger = new Logger('SeedAdmin');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const configService = app.get(ConfigService);
    const usersService = app.get(UsersService);

    const email = configService.get<string>('ADMIN_SEED_EMAIL');
    const password = configService.get<string>('ADMIN_SEED_PASSWORD');

    if (!email || !password) {
      logger.error(
        'ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD precisam estar definidos no .env.',
      );
      process.exitCode = 1;
      return;
    }

    const existing = await usersService.findByEmail(email);
    if (existing) {
      logger.log(`Admin já existe (${email}). Nenhuma ação necessária.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await usersService.createAdmin({ name: 'Administrador', email, passwordHash });

    logger.log(`Admin criado com sucesso: ${email}`);
  } finally {
    await app.close();
  }
}

bootstrap();
