import {
  IsEmail,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

// Curso e período são obrigatórios no cadastro do Student: sem eles não é
// possível aplicar as regras de filtro de vagas por curso/período (RN10-14).
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsMongoId()
  course: string;

  @IsInt()
  @Min(1)
  period: number;
}
