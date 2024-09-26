import React from "react";
import { Party } from "@daml/types";
import { Ledger, CreateEvent, QueryResult } from "@daml/ledger";
import { Work, UserWallet } from "@daml.js/daml-react";
import WorkList from "./WorkList";

type Props = {
    partyToAlias: Map<Party, string>;
    workProposals: readonly CreateEvent<Work.WorkProposal, undefined, string>[];
    workContracts: readonly CreateEvent<Work.WorkContract, undefined, string>[];
    username: string;
    isWorkerList: boolean;
    isWorkContract: boolean;
    ledger: Ledger;
    wallets: QueryResult<UserWallet.UserWallet, string, string>;
  };
  
  const MyRequests: React.FC<Props> = ({
    partyToAlias,
    workProposals,
    workContracts,
    username,
    isWorkerList,
    isWorkContract,
    ledger,
    wallets,
  }) => {
    return (
        <div>
    
            <WorkList
              partyToAlias={partyToAlias}
              workProposals={workProposals}
              workContracts={workContracts}
              username={username}
              isWorkerList={false}
              isWorkContract={false}
              ledger={ledger}
              wallets={wallets}
            />
        </div>
    )
  }

  export default MyRequests;