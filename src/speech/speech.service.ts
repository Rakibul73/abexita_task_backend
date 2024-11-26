import { Injectable } from '@nestjs/common';
import { AssemblyAI } from 'assemblyai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpeechService {
  constructor(private configService: ConfigService) {}

  async processAudio(buffer: Buffer, mimetype: string): Promise<string> {
    try {
      const assemblyai = new AssemblyAI({
        apiKey: this.configService.get<string>('ASSEMBLYAI_API_KEY'),
      });
      const uploadResponse = await assemblyai.files
        .upload(buffer)
        .catch((error) => {
          throw new Error(`Failed to upload audio file: ${error.message}`);
        });

      console.log(`uploadResponse: ${JSON.stringify(uploadResponse)}`);

      const transcriptResponse = await assemblyai.transcripts.create({
        audio_url: uploadResponse,
      });

      const transcriptId = transcriptResponse.id;

      let status = transcriptResponse.status;
      console.log(`transcriptResponse: ${JSON.stringify(transcriptResponse)}`);
      let transcription = '';

      if (status === 'completed') {
        transcription = transcriptResponse.text;
        return transcription;
      }

      while (status === 'queued' || status === 'processing') {
        // Waiting for 5 seconds before polling again
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const statusResponse = await assemblyai.transcripts.get(transcriptId);

        status = statusResponse.status;
        console.log(`statusResponse: ${JSON.stringify(statusResponse)}`);
        if (status === 'completed') {
          transcription = statusResponse.text;
        } else if (status === 'error') {
          throw new Error(
            statusResponse.error || 'Transcription failed due to an error.',
          );
        }
      }

      console.log(`transcription: ${transcription}`);

      return transcription;
    } catch (error) {
      throw new Error(`Speech recognition failed: ${error.message}`);
    }
  }
}
