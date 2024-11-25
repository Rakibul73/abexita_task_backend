import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { VoiceService } from './voice.service';
import { Professional } from './schemas/voice.schema';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('search')
  async search(@Body('query') query: string) {
    try {
      if (!query) {
        throw new HttpException(
          'Query parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const results = await this.voiceService.searchProfessionals(query);
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
      const result = await this.voiceService.insertMockData(mockData);
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
}
