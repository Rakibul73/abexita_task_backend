import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Professional extends Document {
  @Prop()
  type: string;

  @Prop()
  orgId: string;

  @Prop()
  practitionerId: string;

  @Prop()
  username: string;

  @Prop()
  businessUrl: string;

  @Prop()
  name: string;

  @Prop()
  ranking: number;

  @Prop()
  photo: string;

  @Prop()
  category: string;

  @Prop([String])
  subCategory: string[];

  @Prop()
  rating: number;

  @Prop()
  totalAppointment: number;

  @Prop([String])
  zone: string[];

  @Prop([String])
  branch: string[];

  @Prop()
  areaOfPractice: string;
}

export const ProfessionalSchema = SchemaFactory.createForClass(Professional);
