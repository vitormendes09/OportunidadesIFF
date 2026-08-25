import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';

const logger = new Logger('CreateAdmin');

const EMAIL = 'admin@gmail.com';
const PASSWORD = '123456';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = app.get(UsersService);

    const existing = await usersService.findByEmail(EMAIL);
    if (existing) {
      logger.log(`Admin já existe (${EMAIL}). Nenhuma ação necessária.`);
      return;
    }

    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    await usersService.createAdmin({
      name: 'Administrador',
      email: EMAIL,
      passwordHash,
    });

    logger.log(`Admin criado com sucesso: ${EMAIL}`);
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  logger.error('Falha ao criar o Admin.', error);
  process.exitCode = 1;
});
