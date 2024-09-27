import React, { useState, useEffect } from "react";
import { Form, Input, Button, DropdownProps } from "semantic-ui-react";
import { WorkProposal, RateType } from "@daml.js/daml-react/lib/Work/module";
import RateTypeSelector from "./formComponents/RateTypeSelector";


interface Props {
  onSubmit: (data: WorkProposal) => void;
  onCancel: () => void;
  initialValues: WorkProposal;
}

const EditProposalForm: React.FC<Props> = ({
  onSubmit,
  onCancel,
  initialValues
}) => {
  const [formData, setFormData] = useState<WorkProposal>(initialValues);
  const [totalAmount, setTotalAmount] = useState<string>("0.00");

  // Handle dynamic rate type changes
  const handleRateTypeChange = (
    event: React.SyntheticEvent<HTMLElement>,
    data: DropdownProps
  ) => {
    const { value } = data;
    setFormData((prev) => ({
      ...prev,
      rateType:
        value === "FlatFee"
          ? ({ tag: "FlatFee", value: { amount: "" } } as RateType)
          : ({ tag: "HourlyRate", value: { rate: "", hours: "" } } as RateType),
    }));
  };

  // Unified handler for rate changes
  const handleRateAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const { rateType } = prev;

      if (rateType.tag === "FlatFee") {
        // Ensure `FlatFee` has `amount` property
        return {
          ...prev,
          rateType: {
            tag: "FlatFee",
            value: {
              ...rateType.value, // Preserve existing values in case there are other fields
              amount:
                name === "amount"
                  ? value
                  : (rateType.value as RateType.FlatFee).amount,
            },
          },
        };
      } else if (rateType.tag === "HourlyRate") {
        // Ensure `HourlyRate` has `rate` and `hours` properties
        return {
          ...prev,
          rateType: {
            tag: "HourlyRate",
            value: {
              ...rateType.value, // Preserve existing values in case there are other fields
              rate:
                name === "rate"
                  ? value
                  : (rateType.value as RateType.HourlyRate).rate,
              hours:
                name === "hours"
                  ? value
                  : (rateType.value as RateType.HourlyRate).hours,
            },
          },
        };
      } else {
        // Default case, just return the unchanged form data
        return prev;
      }
    });
  };

  useEffect(() => {
    let calculatedAmount = "0.00";
    if (formData.rateType.tag === "HourlyRate") {
      calculatedAmount = (
        Number(formData.rateType.value.rate || 0) *
        Number(formData.rateType.value.hours || 0)
      ).toFixed(2);
    } else if (formData.rateType.tag === "FlatFee") {
      calculatedAmount = formData.rateType.value.amount || "0.00";
    }
    setTotalAmount(calculatedAmount);
    setFormData({...formData, totalAmount: totalAmount}) // Update totalAmount state
  }, [
    formData.rateType,
    formData.rateType.tag === "HourlyRate" ? formData.rateType.value.rate : undefined,
    formData.rateType.tag === "HourlyRate" ? formData.rateType.value.hours : undefined,
    formData.rateType.tag === "FlatFee" ? formData.rateType.value.amount : undefined,
    totalAmount
  ]);

  // Generalized handleChange function
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Validate jobCategory
    if (!formData.jobCategory) {
      alert("Job Category is required.");
      return;
    }

    const submissionData: WorkProposal = {
      ...formData,
      rateType:
        formData.rateType.tag === "HourlyRate"
          ? {
              tag: "HourlyRate",
              value: {
                rate: formData.rateType.value.rate,
                hours: formData.rateType.value.hours,
              },
            }
          : {
              tag: "FlatFee",
              value: { amount: formData.rateType.value.amount },
            },
            totalAmount: formData.totalAmount,
    };
    console.log("Submitting proposal", submissionData);
    onSubmit(submissionData);
  };

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
      <RateTypeSelector
        rateType={formData.rateType}
        onRateTypeChange={handleRateTypeChange}
        onRateAmountChange={handleRateAmountChange}
      />
       <Form.Field>
        <label>Total Amount Due</label>
        <Input
          name="totalAmount"
          value={totalAmount}
          readOnly
          placeholder="Total Amount"
        />
      </Form.Field>
      <Button type="submit" primary>
        Submit
      </Button>
      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
    </Form>
  );
};

export default EditProposalForm;
