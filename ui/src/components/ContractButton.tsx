import React from "react";
import { Button, SemanticCOLORS } from "semantic-ui-react";
import { ContractId } from "@daml/types";
import { Work } from "@daml.js/daml-react";

type ButtonProps = {
  contractId: ContractId<Work.WorkProposal>;
  onAction: (contractId: ContractId<Work.WorkProposal>) => void;
  actionLabel: string;
  color: SemanticCOLORS;
};

const ContractButton: React.FC<ButtonProps> = ({
  contractId,
  onAction,
  actionLabel,
  color,
}) => {
  return (
    <Button color={color} onClick={() => onAction(contractId)}>
      {actionLabel}
    </Button>
  );
};

export default ContractButton;
