import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Professional, ProfessionalSchema } from './schemas/voice.schema';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { SpeechModule } from 'src/speech/speech.module';

@Module({
  imports: [
    SpeechModule,
    MongooseModule.forFeature([
      { name: Professional.name, schema: ProfessionalSchema },
    ]),
  ],
  controllers: [AssistantController],
  providers: [AssistantService],
  exports: [],
})
export class AssistantModule {}
