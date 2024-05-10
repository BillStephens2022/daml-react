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
import { Party } from "@daml/types";
import { CreateEvent } from "@daml/ledger";
import { Work } from "@daml.js/daml-react";

type Props = {
  partyToAlias: Map<Party, string>;
  workProposals: readonly CreateEvent<Work.WorkProposal, undefined, string>[];
  username: string;
  isWorkerList: boolean;
};

const WorkList: React.FC<Props> = ({
  partyToAlias,
  workProposals,
  username,
  isWorkerList,
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

  // Determine which headers, proposals to use based on isWorkerList
  const headersToUse = isWorkerList ? workerHeaders : clientHeaders;
  const proposalsToUse = isWorkerList ? workerProposals : clientProposals;
  

  return (
    <Segment>
      <Header as="h2">
        {isWorkerList ? (<Icon name="exclamation triangle" color="red" />) : (<Icon name="wrench" color="blue" />) }
        <Header.Content>
          {headersToUse[0]}
          <Header.Subheader>
            {headersToUse[1]}
          </Header.Subheader>
        </Header.Content>
      </Header>
      <Divider />
      <Grid columns={3} stackable>
        {proposalsToUse.map((proposal) => (
          <Grid.Column key={proposal.contractId}>
            <Segment style={{ minWidth: 0, width: "auto" }}>
              <Header as="h3">{proposal.payload.jobTitle}</Header>
              <p>
                <strong>Client:</strong>{" "}
                {partyToAlias.get(proposal.payload.client) ?? "Unknown"}
              </p>
              <p>
                <strong>Worker:</strong>{" "}
                {partyToAlias.get(proposal.payload.worker) ?? "Unknown"}
              </p>
              <p>
                <strong>Category:</strong> {proposal.payload.jobCategory}
              </p>
              <p>
                <strong>Description:</strong> {proposal.payload.jobDescription}
              </p>
              <p>
                <strong>Note:</strong> {proposal.payload.note}
              </p>
              <p>
                <strong>Rate Type:</strong> {proposal.payload.rateType}
              </p>
              <p>
                <strong>Rate Amount:</strong> {proposal.payload.rateAmount}
              </p>
              {isWorkerList && (<Button.Group fluid>
                <Button color="blue">Accept</Button>
                <Button.Or />
                <Button color="red">Reject</Button>
              </Button.Group>)}
            </Segment>
          </Grid.Column>
        ))}
      </Grid>
    </Segment>
  );
};

export default WorkList;
