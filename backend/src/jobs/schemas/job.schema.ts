import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ContractType } from '../enums/contract-type.enum';
import { WorkModel } from '../enums/work-model.enum';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  companyName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ContractType })
  contractType: ContractType;

  @Prop({ required: true, enum: WorkModel })
  workModel: WorkModel;

  @Prop({ required: true, trim: true })
  companyLocation: string;

  @Prop({ required: true, trim: true })
  workLocation: string;

  @Prop({ required: true, default: false })
  hasBenefits: boolean;

  @Prop()
  benefitsDescription?: string;

  @Prop()
  salary?: string;

  @Prop({ required: true })
  applicationUrl: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], required: true })
  courses: Types.ObjectId[];

  @Prop()
  requiredPeriod?: number;

  @Prop({ type: [String], default: [] })
  specialties: string[];

  @Prop({ default: true })
  isActive: boolean;

  // RN22: sem expiração automática — só muda para false via ação manual do Admin
  // (DELETE /jobs/:id ou PATCH /jobs/:id). Nenhum cron/job de expiração por data.
  @Prop({ default: Date.now })
  publishedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
