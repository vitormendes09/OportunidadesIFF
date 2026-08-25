import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CoursesService } from '../courses/courses.service';

const logger = new Logger('CreateCourses');

const COURSES = [
  'Engenharia Mecânica',
  'Engenharia de Produção',
  'Sistemas de Informação',
  'Administração',
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const coursesService = app.get(CoursesService);

    for (const name of COURSES) {
      const existing = await coursesService
        .findAll(true)
        .then((courses) => courses.find((c) => c.name === name));

      if (existing) {
        logger.log(`Curso já existe (${name}). Nenhuma ação necessária.`);
        continue;
      }

      await coursesService.create({ name });
      logger.log(`Curso criado com sucesso: ${name}`);
    }
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  logger.error('Falha ao criar os cursos.', error);
  process.exitCode = 1;
});
