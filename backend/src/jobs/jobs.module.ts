import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from '../courses/courses.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job, JobSchema } from './schemas/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    CoursesModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
