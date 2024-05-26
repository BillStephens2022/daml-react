import React from "react";
import { Button } from "semantic-ui-react";
import { ContractId } from "@daml/types";
import { Work } from "@daml.js/daml-react";

type EditButtonProps = {
  contractId: ContractId<Work.WorkProposal>;
  onEdit: (contractId: ContractId<Work.WorkProposal>) => void;
  onCancel: (contractId: ContractId<Work.WorkProposal>) => void;
};

const EditButton: React.FC<EditButtonProps> = ({ contractId, onEdit, onCancel }) => {
  return (
    <Button.Group>
      <Button color="yellow" onClick={() => onEdit(contractId)}>
        Edit
      </Button>
      <Button.Or />
      <Button color="red" onClick={() => onCancel(contractId)}>
        Cancel
      </Button>
    </Button.Group>
  );
};

export default EditButton;
