import React, { useState } from "react";
import {
  Form,
  Input,
  Dropdown,
  Button
} from "semantic-ui-react";
import { RateType, WorkRequest } from "../types";

const RateOptions = [
  { key: "hourly", value: "Hourly", text: "Hourly" },
  { key: "flat", value: "Flat", text: "Flat" },
];

interface Props {
  onSubmit: (data: WorkRequest) => void;
  onCancel: () => void;
  initialValues: WorkRequest;
}

const EditProposalForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  initialValues,
}) => {
  const [formData, setFormData] = useState<WorkRequest>(
    initialValues as WorkRequest
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === "rateAmount" ? parseFloat(value) : value; // Convert value to number for rateAmount
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = () => {
    console.log("Form Data: ", formData);
    onSubmit(formData);
  };

  // Check if initialValues is not null before using it
  if (!initialValues) {
    return null; // Or return a loading indicator or something else
  }

  return (
    <Form onSubmit={handleSubmit}>
      {/* <Form.Field>
        <label>Job Category</label>
        <Input
          name="jobCategory"
          value={formData.jobCategory || ""}
          onChange={handleChange}
          placeholder="Job Category"
          required
        />
      </Form.Field> */}
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
          value={formData.rateAmount.toString()}
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

export default EditProposalForm;
