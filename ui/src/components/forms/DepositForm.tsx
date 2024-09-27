import React, { useState } from "react";
import { Form, Input, Button } from "semantic-ui-react";


interface Props {
  onSubmit: (depositAmount: number) => void;
  onCancel: () => void;
}

const DepositForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [depositAmount, setDepositAmount] = useState(0.00);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositAmount(parseInt(e.target.value));
  };

  const handleSubmit = () => {
    onSubmit(depositAmount);
  };


  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Deposit Amount</label>
        <Input
          value={depositAmount}
          onChange={handleChange}
          placeholder="Enter an Amount"
          required
        />
      </Form.Field>

      <Button type="submit" primary>Submit</Button>
      <Button onClick={onCancel} type="button">
        Cancel
      </Button>
    </Form>
  );
};

export default DepositForm;