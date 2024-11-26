import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpeechModule } from './speech/speech.module';
import { AssistantModule } from './assistant/assistant.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SpeechModule,
    AssistantModule,
    MongooseModule.forRoot(
      'mongodb+srv://rakib:rakib@rakib.7rgkzty.mongodb.net/voice_assistant_db',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
