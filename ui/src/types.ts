export type RateType = 'Hourly' | 'Flat';


type NullableSkillset = Skillset | null;

export interface WorkRequest {
  client: string;
  worker: string;
  jobCategory: NullableSkillset;
  jobTitle: string;
  jobDescription: string;
  note: string;
  rateType: RateType;
  rateAmount: number;
  rejected: boolean;
}

export enum Skillset {
  Handyman = "Handyman",
  Technology = "Technology",
  Landscaping = "Landscaping",
  Financial = "Financial",
  Housekeeping = "Housekeeping",
}