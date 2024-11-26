import { Module } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [],
  providers: [SpeechService, ConfigService],
  exports: [SpeechService],
})
export class SpeechModule {}
