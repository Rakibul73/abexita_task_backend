import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Professional } from './schemas/voice.schema';

const SEARCH_KEYWORDS = {
  PRACTITIONER: ['doctor', 'doc', 'practitioner', 'dr'],
  ORGANIZATION: ['hospital', 'organization', 'hosp', 'clinic'],
  SORT_HIGH: ['best', 'top', 'highest'],
  SORT_LOW: ['worst', 'lowest', 'bad'],
  PREPOSITIONS: ['in', 'at', 'on', 'to', 'for', 'with', 'by', 'from', 'of', 'near', 'around'],
  STOP_WORDS: [
    'a', 'an', 'the', 
    'me', 'my', 'mine', 'i',
    'give', 'show', 'find', 'get', 'tell',
    'want', 'need', 'looking',
    'can', 'could', 'would', 'should',
    'please', 'thanks', 'thank',
    'this', 'that', 'these', 'those',
    'who', 'what', 'where', 'when', 'how',
    'and', 'or', 'but', 'so', 'because',
    'any', 'some', 'few', 'many',
    'here', 'there'
  ],
  QUERY_STARTERS: ['find', 'search', 'locate', 'look', 'show']
};

@Injectable()
export class AssistantService {
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
      ...SEARCH_KEYWORDS.QUERY_STARTERS,
      ...SEARCH_KEYWORDS.STOP_WORDS,
    ];

    return query
      .toLowerCase()
      .replace(/[.,?]/g, '') // Remove periods, commas, and question marks
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

  async insertMockData(mockData: Professional[]): Promise<Professional[]> {
    return this.professionalModel.insertMany(mockData);
  }
}
