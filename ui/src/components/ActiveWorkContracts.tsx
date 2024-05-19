import React, { useState } from "react";
import {
  Segment,
  Header,
  Divider,
  Grid,
  Button,
  Icon,
  Modal,
} from "semantic-ui-react";
import { ContractId, Party } from "@daml/types";
import { Ledger, CreateEvent } from "@daml/ledger";
import { Work } from "@daml.js/daml-react";
import RejectForm from "./RejectForm";
import EditProposalForm from "./EditProposalForm";  
import WorkList from "./WorkList";

type Props = {
    partyToAlias: Map<Party, string>;
    workProposals: readonly CreateEvent<Work.WorkProposal, undefined, string>[];
    workContracts: readonly CreateEvent<Work.WorkContract, undefined, string>[];
    username: string;
    isWorkerList: boolean;
    isWorkContract: boolean;
    ledger: Ledger;
  };
  
  const ActiveWorkContracts: React.FC<Props> = ({
    partyToAlias,
    workProposals,
    workContracts,
    username,
    isWorkerList,
    isWorkContract,
    ledger,
  }) => {
    return (
        <Segment>
            <Header>
                Active Work Contracts
            </Header>
            <WorkList
              partyToAlias={partyToAlias}
              workProposals={workProposals}
              workContracts={workContracts}
              username={username}
              isWorkerList={false}
              isWorkContract={true}
              ledger={ledger}
            />
        </Segment>
    )
  }

  export default ActiveWorkContracts;