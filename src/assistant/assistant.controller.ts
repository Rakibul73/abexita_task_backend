import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssistantService } from './assistant.service';
import { Professional } from './schemas/voice.schema';
import { SpeechService } from 'src/speech/speech.service';

@Controller('assistant')
export class AssistantController {
  constructor(
    private readonly assistantService: AssistantService,
    private readonly speechService: SpeechService,
  ) {}

  @Post('search')
  async search(@Body('query') query: string) {
    try {
      if (!query) {
        throw new HttpException(
          'Query parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const results = await this.assistantService.searchProfessionals(query);
      return {
        statusCode: HttpStatus.OK,
        message: 'Search completed successfully',
        data: results,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred while searching professionals',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('insertMockData')
  async insertMockData(@Body() mockData: Professional[]) {
    try {
      if (!Array.isArray(mockData) || mockData.length === 0) {
        throw new HttpException(
          'Valid mock data array is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.assistantService.insertMockData(mockData);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Mock data inserted successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred while inserting mock data',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('audio'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException(
          'Audio file is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(file.buffer);
      const transcribedText = await this.speechService.processAudio(
        file.buffer,
        file.mimetype,
      );

      console.log(transcribedText);

      const results =
        await this.assistantService.searchProfessionals(transcribedText);
      return {
        statusCode: HttpStatus.OK,
        message: 'Search completed successfully',
        data: results,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred while processing the audio file',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
