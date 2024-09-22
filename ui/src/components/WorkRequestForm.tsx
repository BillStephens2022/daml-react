import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Dropdown,
  Button,
  DropdownProps,
} from "semantic-ui-react";
import {
  RateType,
  WorkRequest,
  WorkRequestDAML,
} from "../types";
import { Skillset } from "@daml.js/daml-react/lib/Common/module";
import { Work } from "@daml.js/daml-react";

const RateOptions = [
  { key: "hourly", value: "HourlyRate", text: "Hourly" },
  { key: "flat", value: "FlatFee", text: "Flat" },
];

const validSkillsetValues = Object.values(Skillset).filter(
  (value) => typeof value === "string"
);

// Define options for the dropdown dynamically based on Skillset values
const jobCategoryOptions = validSkillsetValues.map((skillset) => ({
  key: skillset,
  value: skillset,
  text: skillset,
}));

console.log("Job Category Options: ", jobCategoryOptions);
console.log("Skillset enum values: ", Object.values(Skillset));

interface Props {
  onSubmit: (data: WorkRequestDAML) => void;
  onCancel: () => void;
  username: string;
  userAliases: string[];
  users: { payload: { username: string; alias: string; skillset: Skillset } }[];
}

const WorkRequestForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  username,
  userAliases,
  users,
}) => {
  const [formData, setFormData] = useState<WorkRequest>({
    client: username,
    worker: "",
    jobCategory: null,
    jobTitle: "",
    jobDescription: "",
    note: "",
    rateType: "HourlyRate",
    rateAmount: 0,
    hours: 0,
    totalAmount: 0,
    status: "Awaiting Review",
  });

  const [jobCategorySelected, setJobCategorySelected] =
    useState<boolean>(false);

  const [userOptions, setUserOptions] = useState<
    { key: string; value: string; text: string }[]
  >([]);

  console.log("USERS WORKREQUESTFORM: ", users);

  useEffect(() => {
    if (jobCategorySelected) {
      const filteredUsers = users
        .filter((user) => {
          const skillset = user.payload.skillset;
          console.log(`User: ${user.payload.username}, Skillset: ${skillset}`);
          return skillset === formData.jobCategory;
        })
        .map((user) => ({
          key: user.payload.username,
          value: user.payload.alias,
          text: user.payload.alias,
        }));
      setUserOptions(filteredUsers);
    }
  }, [formData.jobCategory, users, jobCategorySelected]);

  useEffect(() => {
    // let structuredRateType: Work.RateType;
    // if (formData.rateType === "HourlyRate") {
    //   structuredRateType = {
    //     tag: "HourlyRate",
    //     value: {
    //       rate: formData.rateAmount.toFixed(2),
    //       hours: formData.hours.toFixed(2),
    //     },
    //   };
    // } else {
    //   structuredRateType = {
    //     tag: "FlatFee",
    //     value: { amount: formData.rateAmount.toFixed(2) },
    //   };
    // }
    setFormData({ ...formData, rateType: formData.rateType }); // Maintain original rateType for UI
  }, [formData.rateType, formData.rateAmount, formData.hours]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue =
      name === "rateAmount" || name === "hours" ? parseFloat(value) : value; // Convert value to number for rateAmount
    setFormData({ ...formData, [name]: newValue });
  };

  const handleJobCategoryChange = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    const { value } = data;
    setFormData({ ...formData, jobCategory: value as Skillset | null }); // Allow setting null
    setJobCategorySelected(true);
  };

  const handleWorkerChange = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    const { value } = data; // Extract the value from data
    setFormData({ ...formData, worker: value as string }); // Use value as string
  };

  const handleRateTypeChange = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    const { value } = data;
    setFormData({ ...formData, rateType: value as RateType });
  };

  useEffect(() => {
    const calculatedAmount =
      formData.rateType === "HourlyRate"
        ? formData.rateAmount * formData.hours
        : formData.rateAmount;
    setFormData({ ...formData, totalAmount: calculatedAmount });
  }, [formData.rateType, formData.rateAmount, formData.hours]);

  const handleSubmit = () => {
    console.log("Form Data: ", formData);
    // Validate jobCategory
    if (!formData.jobCategory) {
      alert("Job Category is required.");
      return;
    }
    // Construct RateType as per DAML
    let structuredRateType: Work.RateType;
    if (formData.rateType === "HourlyRate") {
      structuredRateType = {
        tag: "HourlyRate",
        value: {
          rate: formData.rateAmount.toFixed(2),
          hours: formData.hours.toFixed(2),
        },
      };
    } else {
      structuredRateType = {
        tag: "FlatFee",
        value: {
          amount: formData.rateAmount.toFixed(2),
        },
      };
    }

    // Calculate totalAmount as string
    const totalAmountDAML =
      formData.rateType === "HourlyRate"
        ? (formData.rateAmount * formData.hours).toFixed(2)
        : formData.rateAmount.toFixed(2);

    const submissionData: WorkRequestDAML = {
      client: formData.client,
      worker: formData.worker,
      jobCategory: formData.jobCategory, // Ensure non-null
      jobTitle: formData.jobTitle,
      jobDescription: formData.jobDescription,
      note: formData.note,
      rateType: structuredRateType,
      totalAmount: totalAmountDAML,
      status: formData.status,
    };

    console.log("Submission Data: ", submissionData);
    onSubmit(submissionData);
  };

  console.log("user ALIASES: ", userAliases);
  console.log("user options: ", userOptions);

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Client</label>
        <Input
          name="client"
          value={username}
          onChange={handleChange}
          placeholder="Client"
          required
        />
      </Form.Field>
      <Form.Field>
        <label>Job Category</label>
        <Dropdown
          name="jobCategory"
          value={formData.jobCategory || ""}
          onChange={handleJobCategoryChange}
          placeholder="Job Category"
          fluid
          search
          selection
          options={jobCategoryOptions}
          required
        />
      </Form.Field>
      <Form.Field>
        <label>Worker</label>
        <Dropdown
          name="worker"
          placeholder="Select Worker"
          fluid
          selection
          options={userOptions}
          onChange={handleWorkerChange}
          disabled={!jobCategorySelected}
          required
        />
      </Form.Field>
      <Form.Field>
        <label>Job Title</label>
        <Input
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          placeholder="Job Title"
          required
        />
      </Form.Field>
      <Form.Field>
        <label>Job Description</label>
        <Input
          name="jobDescription"
          value={formData.jobDescription}
          onChange={handleChange}
          placeholder="Job Description"
          required
        />
      </Form.Field>
      <Form.Field>
        <label>Note</label>
        <Input
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Note"
        />
      </Form.Field>
      <Form.Field>
        <label>Rate Type</label>
        <Dropdown
          name="rateType"
          value={formData.rateType}
          onChange={handleRateTypeChange}
          placeholder="Select Rate Type"
          fluid
          selection
          options={RateOptions}
          required
        />
      </Form.Field>
      <Form.Field>
        <label>
          {formData.rateType === "FlatFee" ? "Flat Fee:" : "Hourly Rate"}
        </label>
        <Input
          type="number"
          name="rateAmount"
          value={formData.rateAmount}
          onChange={handleChange}
          placeholder="Rate Amount"
          required
        />
      </Form.Field>
      {formData.rateType === "HourlyRate" && (
        <>
          <Form.Field>
            <label>Number of Hours</label>
            <Input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              placeholder="Number of Hours"
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Total Amount Due</label>
            <Input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              readOnly
              placeholder="Total Amount"
            />
          </Form.Field>
        </>
      )}
      <Button type="submit">Submit</Button>
      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
    </Form>
  );
};

export default WorkRequestForm;
