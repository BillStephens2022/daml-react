import React from "react";
import { Party } from "@daml/types";
import { Ledger, CreateEvent, QueryResult } from "@daml/ledger";
import { Work } from "@daml.js/daml-react";
import { UserWallet } from "@daml.js/daml-react";
import WorkList from "./WorkList";



type Props = {
    partyToAlias: Map<Party, string>;
    workProposals: readonly CreateEvent<Work.WorkProposal, undefined, string>[];
    workContracts: readonly CreateEvent<Work.WorkContract, undefined, string>[];
    wallets: QueryResult<UserWallet.UserWallet, string, string>;
    username: string;
    ledger: Ledger;
  };
  
  const MyContracts: React.FC<Props> = ({
    partyToAlias,
    workProposals,
    workContracts,
    wallets,
    username,
    ledger,
  }) => {
    return (
        <div>
            <WorkList
              partyToAlias={partyToAlias}
              workProposals={workProposals}
              workContracts={workContracts}
              wallets={wallets}
              username={username}
              isWorkerList={false}
              isWorkContract={true}
              ledger={ledger}
            />
        </div>
    )
  }

  export default MyContracts;