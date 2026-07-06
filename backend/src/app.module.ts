import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

const logger = new Logger('MongoDB');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            logger.log('Conexão com o MongoDB Atlas estabelecida com sucesso.');
          });
          connection.on('error', (error: Error) => {
            logger.error(
              `Falha ao conectar ao MongoDB Atlas: ${error.message}`,
            );
          });
          return connection;
        },
      }),
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    CoursesModule,
  ],
})
export class AppModule {}
