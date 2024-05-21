import React from "react";
import { Party } from "@daml/types";
import { Ledger, CreateEvent } from "@daml/ledger";
import { Work } from "@daml.js/daml-react";
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
  
  const MyJobs: React.FC<Props> = ({
    partyToAlias,
    workProposals,
    workContracts,
    username,
    isWorkerList,
    isWorkContract,
    ledger
  }) => {
    return (
        <div>
          
            <WorkList
              partyToAlias={partyToAlias}
              workProposals={workProposals}
              workContracts={workContracts}
              username={username}
              isWorkerList={true}
              isWorkContract={false}
              ledger={ledger}
            />
        </div>
    )
  }

  export default MyJobs;