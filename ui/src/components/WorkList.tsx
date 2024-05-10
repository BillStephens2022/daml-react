// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import {
  Segment,
  Header,
  Divider,
  Grid,
  Button,
  Icon,
} from "semantic-ui-react";
import { ContractId, Party } from "@daml/types";
import { Ledger, CreateEvent } from "@daml/ledger";
import { Work } from "@daml.js/daml-react";

type Props = {
  partyToAlias: Map<Party, string>;
  workProposals: readonly CreateEvent<Work.WorkProposal, undefined, string>[];
  workContracts: readonly CreateEvent<Work.WorkContract, undefined, string>[];
  username: string;
  isWorkerList: boolean;
  isWorkContract: boolean;
  ledger: Ledger;
};

const WorkList: React.FC<Props> = ({
  partyToAlias,
  workProposals,
  workContracts,
  username,
  isWorkerList,
  isWorkContract,
  ledger
}) => {
  
  // Filter proposals where the current user is the client
  const clientProposals = workProposals.filter(
    (proposal) => proposal.payload.client === username
  );

  // Filter proposals where the current user is the worker
  const workerProposals = workProposals.filter(
    (proposal) => proposal.payload.worker === username
  );

  const workerHeaders = [
    "Work Proposals to Me",
    "Please Action- Accept or Reject the Proposal",
  ];
  const clientHeaders = [
    "My Work Proposals to Others",
    "Pending Worker Approval",
  ];

  const contractHeaders = [
    "Accepted Work Contracts",
    "Active Contracts"
  ]

  // Determine which headers, proposals to use based on isWorkerList
  const headersToUse = isWorkContract ? contractHeaders : (isWorkerList ? workerHeaders : clientHeaders);
  const contractsToUse = isWorkContract ? workContracts : workProposals;
  

  const acceptProposal = async (contractId: ContractId<Work.WorkProposal>) => {
    try {
      await ledger.exercise(Work.WorkProposal.AcceptProposal, contractId, {});
      console.log("Proposal accepted:", contractId);
      // Optionally, you can reload or update the list of proposals after accepting
    } catch (error) {
      console.error("Error accepting proposal:", error);
    }
  };

  return (
    <Segment>
      <Header as="h2">
        {isWorkerList ? (
          <Icon name="exclamation triangle" color="red" />
        ) : (
          <Icon name="wrench" color="blue" />
        )}
        <Header.Content>
          {headersToUse[0]}
          <Header.Subheader>{headersToUse[1]}</Header.Subheader>
        </Header.Content>
      </Header>
      <Divider />
      <Grid columns={3} stackable>
        {contractsToUse.map((contract) => (
          <Grid.Column key={contract.contractId}>
            <Segment style={{ minWidth: 0, width: "auto" }}>
              <Header as="h3">{isWorkContract ? contract.payload.contractJobTitle : contract.payload.jobTitle}</Header>
              <p>
                <strong>Client:</strong>{" "}
                {partyToAlias.get(isWorkContract ? contract.payload.contractClient : contract.payload.client) ?? "Unknown"}
              </p>
              <p>
                <strong>Worker:</strong>{" "}
                {partyToAlias.get(isWorkContract ? contract.payload.contractWorker : contract.payload.worker) ?? "Unknown"}
              </p>
              <p>
                <strong>Category:</strong> {isWorkContract ? contract.payload.contractJobCategory : contract.payload.jobCategory}
              </p>
              <p>
                <strong>Description:</strong> {isWorkContract ? contract.payload.contractJobDescription : contract.payload.jobDescription}
              </p>
              <p>
                <strong>Note:</strong> {isWorkContract ? contract.payload.contractNote : contract.payload.note}
              </p>
              <p>
                <strong>Rate Type:</strong> {isWorkContract ? contract.payload.contractRateType : contract.payload.rateType}
              </p>
              <p>
                <strong>Rate Amount:</strong> {isWorkContract ? contract.payload.contractRateAmount : contract.payload.rateAmount}
              </p>
              {isWorkerList && (
                <Button.Group fluid>
                  <Button
                    color="blue"
                    onClick={() => acceptProposal(contract.contractId)}
                  >
                    Accept
                  </Button>
                  <Button.Or />
                  <Button color="red">Reject</Button>
                </Button.Group>
              )}
            </Segment>
          </Grid.Column>
        ))}
      </Grid>
    </Segment>
  );
};

export default WorkList;
