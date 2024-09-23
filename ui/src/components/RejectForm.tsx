import React, { useState } from "react";
import { Form, TextArea, Button } from "semantic-ui-react";

interface Props {
  onSubmit: (data: string) => void;
  onCancel: () => void;
}

const RejectForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [feedback, setFeedback] = useState<string>("");

  const handleSubmit = () => {
    onSubmit(feedback);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Feedback</label>
        <TextArea
          placeholder="Enter your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </Form.Field>
      <Button type="submit">Submit</Button>
      <Button type="button" onClick={onCancel}>
        Cancel
      </Button>
    </Form>
  );
};

export default RejectForm;
