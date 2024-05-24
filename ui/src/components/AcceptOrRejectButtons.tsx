import React from "react";
import { Button } from "semantic-ui-react";
import { ContractId } from "@daml/types";
import { Work } from "@daml.js/daml-react";

type AcceptOrRejectButtonsProps = {
  contractId: ContractId<Work.WorkProposal>;
  onAccept: (contractId: ContractId<Work.WorkProposal>) => void;
  onReject: (contractId: ContractId<Work.WorkProposal>) => void;
};

const AcceptOrRejectButtons: React.FC<AcceptOrRejectButtonsProps> = ({ contractId, onAccept, onReject }) => {
  return (
    <Button.Group fluid>
      <Button color="blue" onClick={() => onAccept(contractId)}>
        Accept
      </Button>
      <Button.Or />
      <Button color="red" onClick={() => onReject(contractId)}>
        Reject
      </Button>
    </Button.Group>
  );
};

export default AcceptOrRejectButtons;