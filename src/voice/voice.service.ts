import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Professional } from './schemas/voice.schema';

// Constants moved to the top level
const SEARCH_KEYWORDS = {
  PRACTITIONER: ['doctor', 'doc', 'practitioner', 'dr'],
  ORGANIZATION: ['hospital', 'organization', 'hosp', 'clinic'],
  SORT_HIGH: ['best', 'top', 'highest'],
  SORT_LOW: ['worst', 'lowest', 'bad'],
  PREPOSITIONS: ['in', 'at', 'on', 'to', 'for', 'with', 'by', 'from', 'of', 'near', 'around'],
};

@Injectable()
export class VoiceService {
  constructor(
    @InjectModel(Professional.name)
    private professionalModel: Model<Professional>,
  ) {}

  private determineSearchType(query: string): string | null {
    const lowerQuery = query.toLowerCase();
    if (SEARCH_KEYWORDS.PRACTITIONER.some(keyword => lowerQuery.includes(keyword))) {
      return 'Practitioner';
    }
    if (SEARCH_KEYWORDS.ORGANIZATION.some(keyword => lowerQuery.includes(keyword))) {
      return 'Organization';
    }
    return null;
  }

  private determineSortCriteria(query: string): { [key: string]: SortOrder } {
    const lowerQuery = query.toLowerCase();
    if (SEARCH_KEYWORDS.SORT_HIGH.some(keyword => lowerQuery.includes(keyword))) {
      return { rating: -1, ranking: -1 };
    }
    if (SEARCH_KEYWORDS.SORT_LOW.some(keyword => lowerQuery.includes(keyword))) {
      return { rating: 1, ranking: 1 };
    }
    return {};
  }

  private cleanQueryText(query: string): string[] {
    const allKeywords = [
      ...SEARCH_KEYWORDS.PRACTITIONER,
      ...SEARCH_KEYWORDS.ORGANIZATION,
      ...SEARCH_KEYWORDS.SORT_HIGH,
      ...SEARCH_KEYWORDS.SORT_LOW,
      ...SEARCH_KEYWORDS.PREPOSITIONS,
    ];

    return query
      .toLowerCase()
      .split(' ')
      .filter(word => !allKeywords.includes(word))
      .filter(word => word.length > 0);
  }

  private buildSearchConditions(type: string | null, searchWords: string[]): Record<string, any> {
    const conditions = {
      $and: [
        ...(type ? [{ type: type }] : []),
        ...searchWords.map(word => ({
          $or: [
            { name: { $regex: word, $options: 'i' } },
            { zone: { $regex: word, $options: 'i' } },
            { branch: { $regex: word, $options: 'i' } },
            { subCategory: { $regex: word, $options: 'i' } },
          ],
        })),
      ],
    };

    return conditions;
  }

  async searchProfessionals(query: string): Promise<Professional[]> {
    const type = this.determineSearchType(query);
    const sort = this.determineSortCriteria(query);
    const searchWords = this.cleanQueryText(query);
    const searchConditions = this.buildSearchConditions(type, searchWords);

    console.log(`searchConditions: ${JSON.stringify(searchConditions)}`);
    console.log(`sort: ${JSON.stringify(sort)}`);

    return this.professionalModel
      .find(searchConditions)
      .sort(sort)
      .exec();
  }

  // Insert mock data into the database
  async insertMockData(mockData: Professional[]): Promise<Professional[]> {
    return this.professionalModel.insertMany(mockData);
  }
}
