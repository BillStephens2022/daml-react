import { Skillset } from "@daml.js/daml-react/lib/Common/module";

export type RateType = 'Hourly' | 'Flat';


export type NullableSkillset = Skillset | null;

export interface WorkRequest {
  client: string;
  worker: string;
  jobCategory: NullableSkillset;
  jobTitle: string;
  jobDescription: string;
  note: string;
  rateType: RateType;
  rateAmount: number;
  status: string;
}

// export enum Skillset {
//   Handyman = "Handyman",
//   Technology = "Technology",
//   Landscaping = "Landscaping",
//   Financial = "Financial",
//   Housekeeping = "Housekeeping",
//   None = "None",
// }