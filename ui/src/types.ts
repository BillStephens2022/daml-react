export type RateType = 'Hourly' | 'Flat';

export interface WorkRequest {
  client: string;
  worker: string;
  jobCategory: string;
  jobTitle: string;
  jobDescription: string;
  note: string;
  rateType: RateType;
  rateAmount: number;
  rejected: boolean;
}

export type Skillset = 'Handyman' | 'Technology' | 'Landscaping' | 'Financial' | 'Housekeeping';