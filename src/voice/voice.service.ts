import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Professional } from './schemas/voice.schema';

@Injectable()
export class VoiceService {
  constructor(
    @InjectModel(Professional.name)
    private professionalModel: Model<Professional>,
  ) {}

  async searchProfessionals(query: string): Promise<Professional[]> {
    const lowerQuery = query.toLowerCase();
    // Initialize variables
    let searchType = null;
    let conditions: any = {};
    let sort: any = {};

    // Parse query
    if (lowerQuery.includes('doctor') || lowerQuery.includes('doct')) {
      searchType = 'Practitioner';
    } else if (lowerQuery.includes('hospital') || lowerQuery.includes('hosp')) {
      searchType = 'Hospital';
    }

    if (lowerQuery.includes('uttara')) {
      conditions.branch = 'uttara';
    } else if (lowerQuery.includes('dhaka')) {
      conditions.zone = 'dhaka';
    }

    if (lowerQuery.includes('best') || lowerQuery.includes('highest')) {
      sort = { rating: -1, ranking: -1 }; // Sort by rating and ranking descending
    } else if (lowerQuery.includes('worst') || lowerQuery.includes('lowest')) {
      sort = { rating: 1, ranking: 1 }; // Sort by rating and ranking ascending
    }

    if (lowerQuery.includes('bad')) {
      conditions.rating = { $lte: 3 }; // Find low-rated practitioners or hospitals
    }

    // Add type condition
    if (searchType) {
      conditions.type = searchType;
    }

    console.log(`conditions: ${JSON.stringify(conditions)}`);
    console.log(`sort: ${JSON.stringify(sort)}`);

    // Query the database
    const result = await this.professionalModel
      .find(conditions)
      .sort(sort)
      .exec();
    return result;
  }

  // Insert mock data into the database
  async insertMockData(mockData: Professional[]): Promise<Professional[]> {
    return this.professionalModel.insertMany(mockData);
  }
}
