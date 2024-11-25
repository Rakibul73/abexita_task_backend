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
    // Build dynamic conditions
    let searchConditions: any = {};
    let sort: any = {};

    // Detect type (doctor or hospital)
    if (
      lowerQuery.includes('doctor') ||
      lowerQuery.includes('doc') ||
      lowerQuery.includes('practitioner') ||
      lowerQuery.includes('dr')
    ) {
      searchConditions.type = 'Practitioner';
    } else if (
      lowerQuery.includes('hospital') ||
      lowerQuery.includes('organization') ||
      lowerQuery.includes('hosp') ||
      lowerQuery.includes('clinic')
    ) {
      searchConditions.type = 'Organization';
    }

    // Handle sorting based on keywords
    if (
      lowerQuery.includes('best') ||
      lowerQuery.includes('top') ||
      lowerQuery.includes('highest')
    ) {
      sort = { rating: -1, ranking: -1 };
    } else if (
      lowerQuery.includes('worst') ||
      lowerQuery.includes('lowest') ||
      lowerQuery.includes('bad')
    ) {
      sort = { rating: 1, ranking: 1 };
    }

    const typeKeywords = [
      'doctor',
      'doc',
      'dr',
      'hospital',
      'clinic',
      'practitioner',
      'organization',
    ];

    const sortKeywords = ['best', 'worst', 'highest', 'lowest', 'top', 'bad'];

    const prepositions = [
      'in',
      'at',
      'on',
      'to',
      'for',
      'with',
      'by',
      'from',
      'of',
      'near',
      'around',
    ];

    // Clean the query text by removing irrelevant words (type and sort keywords)
    const cleanQuery = lowerQuery
      .split(' ')
      .filter(
        (word) =>
          ![...typeKeywords, ...sortKeywords, ...prepositions].includes(word),
      ) // Remove type and sort-related words
      .join(' ');

    // Split cleanQuery into individual words and filter out empty strings
    const searchWords = cleanQuery.split(' ').filter((word) => word.length > 0);

    // Prepare a dynamic inclusive search for zone, branch, subCategory, name etc.
    searchConditions = {
      $and: searchWords.map((word) => ({
        $or: [
          { name: { $regex: word, $options: 'i' } },
          { zone: { $regex: word, $options: 'i' } },
          { branch: { $regex: word, $options: 'i' } },
          { subCategory: { $regex: word, $options: 'i' } },
        ],
      })),
    };

    console.log(` searchConditions: ${JSON.stringify(searchConditions)}`);
    console.log(` sort: ${JSON.stringify(sort)}`);

    // Execute the query with the dynamic conditions and sorting
    const result = await this.professionalModel
      .find(searchConditions)
      .sort(sort)
      .exec();

    return result;
  }

  // Insert mock data into the database
  async insertMockData(mockData: Professional[]): Promise<Professional[]> {
    return this.professionalModel.insertMany(mockData);
  }
}
