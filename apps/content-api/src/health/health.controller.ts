import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('healthz')
  health() { return { status: 'ok' }; }
}
