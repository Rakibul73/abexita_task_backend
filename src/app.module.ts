import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VoiceModule } from './voice/voice.module';

@Module({
  imports: [
    VoiceModule,
    MongooseModule.forRoot(
      'mongodb+srv://rakib:rakib@rakib.7rgkzty.mongodb.net/voice_assistant_db',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
