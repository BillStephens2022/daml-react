import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Dropdown,
  Button,
  DropdownProps,
} from "semantic-ui-react";
import { RateType, WorkRequest } from "../types";
import { Skillset } from "@daml.js/daml-react/lib/Common/module";

const RateOptions = [
  { key: "hourly", value: "Hourly", text: "Hourly" },
  { key: "flat", value: "Flat", text: "Flat" },
];

const validSkillsetValues = Object.values(Skillset).filter(
  value => typeof value === "string"
);

 // Define options for the dropdown dynamically based on Skillset values
 const jobCategoryOptions = validSkillsetValues.map(skillset => ({
  key: skillset,
  value: skillset,
  text: skillset,
}));

console.log("Job Category Options: ", jobCategoryOptions);
console.log("Skillset enum values: ", Object.values(Skillset));

interface Props {
  onSubmit: (data: WorkRequest) => void;
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
  users
}) => {
  const [formData, setFormData] = useState<WorkRequest>({
    client: username,
    worker: "",
    jobCategory: null,
    jobTitle: "",
    jobDescription: "",
    note: "",
    rateType: "Hourly",
    rateAmount: 0,
    status: "Awaiting Review",
  });

  const [jobCategorySelected, setJobCategorySelected] = useState<boolean>(
    false
  );

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === "rateAmount" ? parseFloat(value) : value; // Convert value to number for rateAmount
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

  

  const handleSubmit = () => {
    console.log("Form Data: ", formData);
    onSubmit(formData);
  };

  // const userOptions = Array.from(allUserAliases.entries()).map(
  //   ([partyId, alias]) => ({
  //     key: partyId,
  //     value: alias,
  //     text: alias,
  //   })
  // );

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
