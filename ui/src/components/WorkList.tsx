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
};

const WorkList: React.FC<Props> = ({ partyToAlias, workProposals }) => {
  return (
    <Segment>
      <Header as="h2">
        <Icon name="wrench" />
        <Header.Content>
          Work Requests
          <Header.Subheader>Open Work Requests</Header.Subheader>
        </Header.Content>
      </Header>
      <Divider />
      <Grid columns={3} stackable>
        {workProposals.map((proposal) => (
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
              <Button.Group fluid>
                <Button color="blue">Accept</Button>
                <Button.Or />
                <Button color="red">Reject</Button>
              </Button.Group>
            </Segment>
          </Grid.Column>
        ))}
      </Grid>
    </Segment>
  );
};

export default WorkList;
