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
import RateTypeSelector from "./formComponents/RateTypeSelector";
import { filterWorkersByJobCategory } from "../../utils/helperFunctions";

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
      setUserOptions(filterWorkersByJobCategory(users, formData.jobCategory));
    }
  }, [formData.jobCategory, users, jobCategorySelected]);

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

  // Calculate total amount
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
    setFormData((prevState) => ({
      ...prevState,
      totalAmount: calculatedAmount,
    }));
  }, [formData.rateType]);

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
          onChange={(e, data) => {
            setJobCategorySelected((prev) => !prev);
            setFormData({ ...formData, jobCategory: data.value as Skillset });
          }}
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
          onChange={(e, data) =>
            setFormData({ ...formData, worker: data.value as string })
          }
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
      <RateTypeSelector
        rateType={formData.rateType}
        onRateTypeChange={handleRateTypeChange}
        onRateAmountChange={handleRateAmountChange}
      />
      <Form.Field>
        <label>Total Amount</label>
        <Input
          name="totalAmount"
          value={formData.totalAmount}
          readOnly
          placeholder="Total Amount"
        />
      </Form.Field>
      <Button type="button" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" primary>
        Submit
      </Button>
    </Form>
  );
};

export default WorkRequestForm;
