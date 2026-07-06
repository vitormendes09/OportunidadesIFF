import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, enum: Role })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  // Course ainda não existe como schema próprio (Etapa 02). Guardamos só o
  // ObjectId de referência agora, sem validar se o curso realmente existe —
  // essa validação será reforçada quando o CourseModule for criado.
  @Prop({ type: Types.ObjectId, ref: 'Course' })
  course?: Types.ObjectId;

  @Prop()
  period?: number;

  @Prop({ select: false })
  emailVerificationToken?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
