import React from "react";
import { Button } from "semantic-ui-react";
import { ContractId } from "@daml/types";
import { Work } from "@daml.js/daml-react";

type AcceptOrRejectButtonsProps = {
  contractId: ContractId<Work.WorkProposal>;
  onEdit: (contractId: ContractId<Work.WorkProposal>) => void;
};

const AcceptOrRejectButtons: React.FC<AcceptOrRejectButtonsProps> = ({
  contractId,
  onEdit,
}) => {
  return (
    <Button color="yellow" onClick={() => onEdit(contractId)}>
      Edit
    </Button>
  );
};

export default AcceptOrRejectButtons;
