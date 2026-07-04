import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check(): { status: string; database: string } {
    const isConnected = this.connection.readyState === 1;

    return {
      status: 'ok',
      database: isConnected ? 'connected' : 'disconnected',
    };
  }
}
