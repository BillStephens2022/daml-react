import React, { useState } from "react";
import {
  Form,
  Input,
  Dropdown,
  Button,
  DropdownProps,
} from "semantic-ui-react";
import { RateType, WorkRequest } from "../types";

const RateOptions = [
  { key: "hourly", value: "Hourly", text: "Hourly" },
  { key: "flat", value: "Flat", text: "Flat" },
];

interface Props {
  onSubmit: (data: WorkRequest) => void;
  onCancel: () => void;
  username: string;
  userAliases: string[];
  allUserAliases: Map<any, any>;
}

const WorkRequestForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  username,
  userAliases,
  allUserAliases,
}) => {
  const [formData, setFormData] = useState<WorkRequest>({
    client: username,
    worker: "",
    jobCategory: "",
    jobTitle: "",
    jobDescription: "",
    note: "",
    rateType: "Hourly",
    rateAmount: 0,
    rejected: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === "rateAmount" ? parseFloat(value) : value; // Convert value to number for rateAmount
    setFormData({ ...formData, [name]: newValue });
  };

  const handleWorkerChange = (
    event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    const { value } = data; // Extract the value from data
    setFormData({ ...formData, worker: value as string }); // Use value as string
  };

  const handleSubmit = () => {
    console.log("Form Data: ", formData);
    onSubmit(formData);
  };

  const userOptions = Array.from(allUserAliases.entries()).map(
    ([partyId, alias]) => ({
      key: partyId,
      value: alias,
      text: alias,
    })
  );

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
        <label>Worker</label>
        <Dropdown
          name="worker"
          placeholder="Select Worker"
          fluid
          selection
          options={userOptions}
          onChange={handleWorkerChange}
          required
        />
      </Form.Field>
      <Form.Field>
        <label>Job Category</label>
        <Input
          name="jobCategory"
          value={formData.jobCategory}
          onChange={handleChange}
          placeholder="Job Category"
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
          onChange={(e, data) =>
            setFormData({ ...formData, rateType: data.value as RateType })
          }
          placeholder="Select Rate Type"
          fluid
          selection
          options={RateOptions}
          required
        />
      </Form.Field>
      <Form.Field>
        <label>Rate Amount</label>
        <Input
          type="number"
          name="rateAmount"
          value={formData.rateAmount}
          onChange={handleChange}
          placeholder="Rate Amount"
          required
        />
      </Form.Field>
      <Button type="submit">Submit</Button>
      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
    </Form>
  );
};

export default WorkRequestForm;
