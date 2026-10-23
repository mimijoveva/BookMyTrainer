import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { SuggestSessionDto } from './dto/suggest-session.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest-session')
  @HttpCode(200)
  suggestSession(@Body() dto: SuggestSessionDto) {
    return this.aiService.suggestSession(dto.goal);
  }
}