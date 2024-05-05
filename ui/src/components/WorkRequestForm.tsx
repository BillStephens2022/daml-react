import React, { useState } from 'react';
import { Form, Input, Dropdown, Button } from 'semantic-ui-react';

type RateType = 'Hourly' | 'Flat';

interface WorkRequest {
  client: string;
  worker: string;
  jobCategory: string;
  jobTitle: string;
  jobDescription: string;
  note: string;
  rateType: RateType;
  rateAmount: number;
}

const RateOptions = [
  { key: 'hourly', value: 'Hourly', text: 'Hourly' },
  { key: 'flat', value: 'Flat', text: 'Flat' },
];

interface Props {
  onSubmit: (data: WorkRequest) => void;
  onCancel: () => void;
}

const WorkRequestForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<WorkRequest>({
    client: '',
    worker: '',
    jobCategory: '',
    jobTitle: '',
    jobDescription: '',
    note: '',
    rateType: 'Hourly',
    rateAmount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Form Data: ", formData)
    onSubmit(formData);
  };

  return (
    
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <label>Client</label>
            <Input
              name="client"
              value={formData.client}
              onChange={handleChange}
              placeholder='Client'
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Worker</label>
            <Input
              name="worker"
              value={formData.worker}
              onChange={handleChange}
              placeholder='Worker'
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Job Category</label>
            <Input
              name="jobCategory"
              value={formData.jobCategory}
              onChange={handleChange}
              placeholder='Job Category'
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Job Title</label>
            <Input
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder='Job Title'
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Job Description</label>
            <Input
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder='Job Description'
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Note</label>
            <Input
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder='Note'
            />
          </Form.Field>
          <Form.Field>
            <label>Rate Type</label>
            <Dropdown
              name="rateType"
              value={formData.rateType}
              onChange={(e, data) => setFormData({ ...formData, rateType: data.value as RateType })}
              placeholder='Select Rate Type'
              fluid
              selection
              options={RateOptions}
              required
            />
          </Form.Field>
          <Form.Field>
            <label>Rate Amount</label>
            <Input
              type='number'
              name="rateAmount"
              value={formData.rateAmount}
              onChange={handleChange}
              placeholder='Rate Amount'
              required
            />
          </Form.Field>
          <Button type='submit'>Submit</Button>
          <Button onClick={onCancel} type='button'>Cancel</Button>
        </Form>
  
  );
};

export default WorkRequestForm;

