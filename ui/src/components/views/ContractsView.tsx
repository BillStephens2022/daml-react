import React, { useState } from "react";
import { Header, Segment } from "semantic-ui-react";
import { Party } from "@daml/types";
import { Ledger, CreateEvent, QueryResult } from "@daml/ledger";
import { Work, UserWallet } from "@daml.js/daml-react";
import MyJobs from "./MyJobs";
import MyRequests from "./MyRequests";
import MyContracts from "./MyContracts";
import classes from "../../styles/MainView.module.css";



type Props = {
  partyToAlias: Map<Party, string>;
  workProposals: readonly CreateEvent<Work.WorkProposal, undefined, string>[];
  workContracts: readonly CreateEvent<Work.WorkContract, undefined, string>[];
  wallets: QueryResult<UserWallet.UserWallet, string, string>;
  username: string;
  isWorkerList: boolean;
  isWorkContract: boolean;
  ledger: Ledger;
}


const ContractsView: React.FC<Props> = ({ partyToAlias, workContracts, workProposals, wallets, username, isWorkerList, isWorkContract, ledger}) => {
  const [view, setView] = useState("jobView");
  const [activeMenuItem, setActiveMenuItem] = useState("jobView");

  const activeContracts = workContracts.filter(contract =>
    ["Active", "Work Completed"].some(status =>
      contract.payload.contractStatus.startsWith(status)
    )
  );

  const completedContracts = workContracts.filter((contract) => contract.payload.contractStatus === "Paid");

  const handleMenuItemClick = (view: string) => {
    setView(view);
    setActiveMenuItem(view);
  };

  return (
    <Segment>
      <Header>Select a View</Header>
      <div className="ui grid">
        <div className="four wide column">
          <div className="ui vertical fluid tabular menu">
            <p
              onClick={() => handleMenuItemClick("jobView")}
              className={`item ${activeMenuItem === "jobView" ? "active" : ""}`}
            >
              My Jobs
            </p>
            <p
              onClick={() => handleMenuItemClick("requestView")}
              className={`item ${
                activeMenuItem === "requestView" ? "active" : ""
              }`}
            >
              My Requests
            </p>
            <p
              onClick={() => handleMenuItemClick("activeContractView")}
              className={`item ${
                activeMenuItem === "activeContractView" ? "active" : ""
              }`}
            >
              Active Contracts
            </p>
            <p
              onClick={() => handleMenuItemClick("completedContractView")}
              className={`item ${
                activeMenuItem === "completedContractView" ? "active" : ""
              }`}
            >
              Completed Contracts
            </p>
          </div>
        </div>
        <div className="twelve wide stretched column">
          <div className={`ui segment ${classes.view}`}>
            {view === "requestView" && (
              <MyRequests
                partyToAlias={partyToAlias}
                workProposals={workProposals}
                workContracts={workContracts}
                wallets={wallets}
                username={username}
                ledger={ledger}
              />
            )}
            {view === "jobView" && (
              <MyJobs
                partyToAlias={partyToAlias}
                workProposals={workProposals}
                workContracts={workContracts}
                wallets={wallets}
                username={username}
                ledger={ledger}
              />
            )}
            {view === "activeContractView" && (
              <MyContracts
                partyToAlias={partyToAlias}
                workProposals={workProposals}
                workContracts={activeContracts}
                wallets={wallets}
                username={username}
                ledger={ledger}
              />
            )}
            {view === "completedContractView" && (
              <MyContracts
                partyToAlias={partyToAlias}
                workProposals={workProposals}
                workContracts={completedContracts}
                wallets={wallets}
                username={username}
                ledger={ledger}
              />
            )}
          </div>
        </div>
      </div>
    </Segment>
  );
};

export default ContractsView;
