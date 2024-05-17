import React, { useState } from "react";
import { Form, Dropdown, Button } from "semantic-ui-react";
import { Skillset } from "@daml.js/daml-react/lib/Common/module";

interface Props {
  onSubmit: (skillset: Skillset) => void;
  onCancel: () => void;
}

const EditSkillsetForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [selectedSkillset, setSelectedSkillset] = useState<Skillset>(Skillset.None);

  // Function to generate dropdown options from the Skillset enum
  const skillsetOptions = Object.values(Skillset).map((skillset) => ({
    key: skillset,
    text: skillset.toString(),
    value: skillset.toString(),
  }));  

  const handleChange = (e: React.SyntheticEvent<HTMLElement, Event>, data: any) => {
    setSelectedSkillset(data.value);
  };

  const handleSubmit = () => {
    onSubmit(selectedSkillset);
  };


  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field>
        <label>Job Category</label>
        <Dropdown
          fluid
          selection
          options={skillsetOptions}
          value={selectedSkillset.toString()}
          onChange={handleChange}
          placeholder="Select a Skillset"
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

export default EditSkillsetForm;
