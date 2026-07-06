import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

// E-mail não é editável de propósito: é o identificador institucional do
// usuário. Assumimos essa restrição por padrão (ver aviso ao final da etapa
// 01 em agents/01-auth-e-usuarios.md) — sinalizar ao dono do produto se essa
// decisão precisar mudar.
export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsMongoId()
  course?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  period?: number;
}
