import { Skillset } from "@daml.js/daml-react/lib/Common/module";
import { Work } from "@daml.js/daml-react";


export interface WorkRequest {
  client: string;
  worker: string;
  jobCategory: Skillset | null;
  jobTitle: string;
  jobDescription: string;
  note: string;
  rateType: Work.RateType;
  rateAmount: number;
  hours: number;
  totalAmount: number;
  status: string;
}

export interface EditWorkRequest {
  client: string;
  worker: string;
  jobCategory: Skillset | null;
  jobTitle: string;
  jobDescription: string;
  note: string;
  rateType: Work.RateType;
  rateAmount?: number;
  hours?: number;
  totalAmount: number;
  status: string;
}
