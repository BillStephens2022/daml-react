import React from "react";
import { Button } from "semantic-ui-react";
import { ContractId } from "@daml/types";
import { Work } from "@daml.js/daml-react";

type CompleteWorkButtonProps = {
  contractId: ContractId<Work.WorkContract>;
  onComplete: (contractId: ContractId<Work.WorkContract>) => void;
};

const CompleteWorkButton: React.FC<CompleteWorkButtonProps> = ({
  contractId,
  onComplete,
}) => {
  return (
    <Button color="blue" onClick={() => onComplete(contractId)}>
      Complete Work
    </Button>
  );
};

export default CompleteWorkButton;