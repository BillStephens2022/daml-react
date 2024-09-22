import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Dropdown,
  Button
} from "semantic-ui-react";
import { RateType, WorkRequest, EditWorkRequest, WorkRequestDAML } from "../types";
import { Work } from "@daml.js/daml-react";

const RateOptions = [
  { key: "hourly", value: "Hourly", text: "Hourly" },
  { key: "flat", value: "Flat", text: "Flat" },
];

interface Props {
  onSubmit: (data: WorkRequestDAML) => void;
  onCancel: () => void;
  initialValues: EditWorkRequest;
}

const EditProposalForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  initialValues,
}) => {
  const [formData, setFormData] = useState<WorkRequest>(
    initialValues as WorkRequest
  );

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
  }, [formData, formData.rateType, formData.rateAmount, formData.hours]);

  useEffect(() => {
    const calculatedAmount =
      formData.rateType === "HourlyRate"
        ? formData.rateAmount * formData.hours
        : formData.rateAmount;
    setFormData({ ...formData, totalAmount: calculatedAmount });
  }, [formData, formData.rateType, formData.rateAmount, formData.hours]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue =
      name === "rateAmount" || name === "hours" ? parseFloat(value) : value; // Convert value to number for rateAmount
    setFormData({ ...formData, [name]: newValue });
  };

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

  // Check if initialValues is not null before using it
  if (!initialValues) {
    return null; // Or return a loading indicator or something else
  }

  return (
    <Form onSubmit={handleSubmit}>
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
