import { Injectable, Logger } from '@nestjs/common';

// Envio real via Nodemailer/Resend é pendência registrada no CLAUDE.md
// (seção 8) — fora do escopo da Etapa 01. Este service apenas loga a
// intenção de envio.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    this.logger.log(
      `[STUB] E-mail de verificação seria enviado para ${to} com token: ${token}`,
    );
  }
}
