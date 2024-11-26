import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Professional, ProfessionalSchema } from './schemas/voice.schema';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { SpeechModule } from 'src/speech/speech.module';

@Module({
  imports: [
    SpeechModule,
    MongooseModule.forFeature([
      { name: Professional.name, schema: ProfessionalSchema },
    ]),
  ],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [],
})
export class VoiceModule {}
