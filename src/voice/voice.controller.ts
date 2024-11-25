import { Controller, Post, Body } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { Professional } from './schemas/voice.schema';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('search')
  async search(@Body('query') query: string) {
    return this.voiceService.searchProfessionals(query);
  }

  // Insert mock data into the database
  @Post('insertMockData')
  async insertMockData(@Body() mockData: Professional[]) {
    return this.voiceService.insertMockData(mockData);
  }
}
