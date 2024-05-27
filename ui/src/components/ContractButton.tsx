import React from "react";
import { Button, SemanticCOLORS } from "semantic-ui-react";
import { ContractId } from "@daml/types";
import { Work } from "@daml.js/daml-react";

type ButtonProps<T> = {
  contractId: ContractId<T>;
  onAction: (contractId: ContractId<T>) => void;
  actionLabel: string;
  color: SemanticCOLORS;
};

const ContractButton = <T,>({
  contractId,
  onAction,
  actionLabel,
  color,
}: ButtonProps<T>) => {
  return (
    <Button color={color} onClick={() => onAction(contractId)}>
      {actionLabel}
    </Button>
  );
};

export default ContractButton;
