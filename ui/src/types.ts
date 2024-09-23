import { Skillset } from "@daml.js/daml-react/lib/Common/module";
import { Work } from "@daml.js/daml-react";

export type RateType = 'HourlyRate' | 'FlatFee';

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
  hours: number;
  totalAmount: number;
  status: string;
}

export interface EditWorkRequest {
  client: string;
  worker: string;
  jobCategory: NullableSkillset;
  jobTitle: string;
  jobDescription: string;
  note: string;
  rateType: RateType;
  rateAmount?: number;
  hours?: number;
  totalAmount: number;
  status: string;
}

export interface WorkRequestDAML {
  client: string;
  worker: string;
  jobCategory: Skillset;
  jobTitle: string;
  jobDescription: string;
  note: string;
  rateType: Work.RateType;
  totalAmount: string;
  status: string;
}
