import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Dropdown,
  Button,
  DropdownProps,
} from "semantic-ui-react";
import { Skillset } from "@daml.js/daml-react/lib/Common/module";
import { WorkProposal, RateType } from "@daml.js/daml-react/lib/Work/module";

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

interface Props {
  onSubmit: (data: WorkProposal) => void;
  onCancel: () => void;
  username: string;
  userAliases: string[];
  users: { payload: { username: string; alias: string; skillset: Skillset } }[];
}

const WorkRequestForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  username,
  users,
}) => {
  const [formData, setFormData] = useState<WorkProposal>({
    client: username,
    worker: "",
    jobCategory: "None",
    jobTitle: "",
    jobDescription: "",
    note: "",
    rateType: {
      tag: "HourlyRate",
      value: { rate: "", hours: "" },
    } as RateType,
    totalAmount: "",
    status: "Awaiting Review",
  });

  const [jobCategorySelected, setJobCategorySelected] =
    useState<boolean>(false);

  const [userOptions, setUserOptions] = useState<
    { key: string; value: string; text: string }[]
  >([]);

  useEffect(() => {
    if (jobCategorySelected) {
      const filteredUsers = users
        .filter((user) => {
          const skillset = user.payload.skillset;
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleJobCategoryChange = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    const { value } = data;
    setFormData({ ...formData, jobCategory: value as Skillset});
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
  
    setFormData((prevState) => {
      if (value === "FlatFee") {
        return {
          ...prevState,
          rateType: {
            tag: "FlatFee",
            value: { amount: "" }, // Ensure FlatFee has an amount field
          },
        };
      } else if (value === "HourlyRate") {
        return {
          ...prevState,
          rateType: {
            tag: "HourlyRate",
            value: { rate: "", hours: "" }, // Ensure HourlyRate has rate and hours fields
          },
        };
      }
      return prevState;
    });
  };

  useEffect(() => {
    let calculatedAmount = "0.00";
    if (formData.rateType.tag === "HourlyRate") {
      calculatedAmount = (Number(formData.rateType.value.rate || 0) * Number(formData.rateType.value.hours || 0)).toFixed(2);
    } else if (formData.rateType.tag === "FlatFee") {
      calculatedAmount = (formData.rateType.value.amount || "0.00");
    }
    setFormData((prevState) => ({
      ...prevState,
      totalAmount: calculatedAmount,
    }));
  }, [formData.rateType]);

  const handleSubmit = () => {
    console.log("Form Data: ", formData);
    // Validate jobCategory
    if (!formData.jobCategory) {
      alert("Job Category is required.");
      return;
    }

    const submissionData: WorkProposal = {
      ...formData,
      rateType: formData.rateType.tag === "HourlyRate"
        ? { tag: "HourlyRate", value: { rate: formData.rateType.value.rate, hours: formData.rateType.value.hours } }
        : { tag: "FlatFee", value: { amount: formData.rateType.value.amount } },
      totalAmount: formData.rateType.tag === "HourlyRate"
        ? (parseFloat(formData.rateType.value.rate) * parseFloat(formData.rateType.value.hours)).toFixed(2)
        : formData.rateType.value.amount,
    };

    console.log("Submission Data: ", submissionData);
    onSubmit(submissionData);
  };

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
          value={formData.rateType.tag}
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
          {formData.rateType.tag === "FlatFee" ? "Flat Fee:" : "Hourly Rate"}
        </label>
        <Input
          type="text"
          name="rateAmount"
          value={
            formData.rateType.tag === "HourlyRate"
              ? formData.rateType.value.rate
              : formData.rateType.value.amount
          }
          onChange={handleChange}
          placeholder="Rate Amount"
          required
        />
      </Form.Field>
      {formData.rateType.tag === "HourlyRate" && (
        <>
          <Form.Field>
            <label>Number of Hours</label>
            <Input
              type="text"
              name="hours"
              value={String(formData.rateType.value.hours)}
              onChange={handleChange}
              placeholder="Number of Hours"
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Total Amount Due</label>
            <Input
              type="text"
              name="totalAmount"
              value={String(formData.totalAmount)}
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
