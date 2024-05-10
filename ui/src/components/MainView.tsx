// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useMemo } from "react";
import {
  Container,
  Grid,
  Header,
  Icon,
  Segment,
  Divider,
  Button,
  Modal,
} from "semantic-ui-react";
import { Party } from "@daml/types";
import { User } from "@daml.js/daml-react";
import { Work } from "@daml.js/daml-react";
import { publicContext, userContext } from "./App";
import WorkRequestForm from "./WorkRequestForm";
import { WorkRequest } from "../types";
import WorkList from "./WorkList";

// USERS_BEGIN
const MainView: React.FC = () => {
  const username = userContext.useParty();
  const myUserResult = userContext.useStreamFetchByKeys(
    User.User,
    () => [username],
    [username]
  );
  const aliases = publicContext.useStreamQueries(User.Alias, () => [], []);
  const users = publicContext.useStreamQueries(User.User, () => [], []);
  const myUser = myUserResult.contracts[0]?.payload;
  const allUsers = userContext.useStreamQueries(User.User).contracts;
  const allWorkProposals = publicContext.useStreamQueries(
    Work.WorkProposal
  ).contracts;

  // USERS_END
  const [showModal, setShowModal] = useState(false);

  const ledger = userContext.useLedger();

  // Map to translate party identifiers to aliases.
  const partyToAlias = useMemo(
    () =>
      new Map<Party, string>(
        aliases.contracts.map(({ payload }) => [
          payload.username,
          payload.alias,
        ])
      ),
    [aliases]
  );

  const allUserAliases = useMemo(() => {
    const userAliases = new Map();
    aliases.contracts.forEach(({ payload }) => {
      userAliases.set(payload.username, payload.alias);
    });
    return userAliases;
  }, [aliases]);

  const myUserName = aliases.loading
    ? "loading ..."
    : partyToAlias.get(username) ?? username;

  // Function to submit a new work request to the DAML ledger
  const submitWorkRequest = async (workRequest: WorkRequest) => {
    try {
      // Convert worker value to lowercase
      const workerLowercase = workRequest.worker.toLowerCase();
      // Find the worker's party
      const workerAlias = aliases.contracts.find(
        (alias) => alias.payload.alias.toLowerCase() === workerLowercase
      );
      if (!workerAlias) {
        console.error("Worker not found.");
        return false;
      }
      console.log("WorkerAlias!: ", workerAlias);
      const workerParty = workerAlias.payload.username;
      const workProposal = await ledger.create(Work.WorkProposal, {
        client: username,
        worker: workerParty,
        jobCategory: workRequest.jobCategory,
        jobTitle: workRequest.jobTitle,
        jobDescription: workRequest.jobDescription,
        note: workRequest.note,
        rateType: workRequest.rateType,
        rateAmount: workRequest.rateAmount,
      });
      console.log("Work proposal created:", workProposal);

      return true;
    } catch (error) {
      console.error("Error creating work proposal:", error);
      return false;
    }
  };

  // Function to handle submission of work request form
  const handleSubmitWorkRequest = (workRequest: WorkRequest) => {
    console.log("Work Request Data:", workRequest as WorkRequest);
    if (typeof workRequest.rateAmount === "number") {
      submitWorkRequest(workRequest).then((success) => {
        if (success) {
          setShowModal(false); // Close the modal after submission
        }
      });
    } else {
      alert("Invalid rateAmount value");
    }
  };

  const handleCancelWorkRequest = () => {
    setShowModal(false); // Close the modal when cancel is clicked
  };

  console.log("Aliases: ", aliases);
  console.log("All Users", users);
  console.log("allUserAliases: ", allUserAliases);
  console.log("allWorkProposals: ", allWorkProposals);

  return (
    <Container>
      <Grid centered columns={1}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header
              as="h1"
              size="huge"
              color="blue"
              textAlign="center"
              style={{ padding: "1ex 0em 0ex 0em" }}
            >
              {myUserName ? `Welcome, ${myUserName}!` : "Loading..."}
            </Header>

            <Segment>
              <Header as="h2">
                <Icon name="user" />
                <Header.Content>{myUserName ?? "Loading..."}</Header.Content>
              </Header>
              <Divider />
            </Segment>

            <Segment>
              <Header as="h2">
                <Icon name="envelope" />
                <Header.Content>Submit a Work Request</Header.Content>
              </Header>
              <Divider />
              <Button type="button" onClick={() => setShowModal(!showModal)}>
                New Request
              </Button>
              <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                closeIcon
              >
                <Modal.Header>New Work Request</Modal.Header>
                <Modal.Content>
                  <WorkRequestForm
                    onSubmit={handleSubmitWorkRequest}
                    onCancel={handleCancelWorkRequest}
                    username={myUserName}
                    userAliases={Array.from(allUserAliases.values())}
                    allUserAliases={allUserAliases}
                  />
                </Modal.Content>
              </Modal>
            </Segment>
            <WorkList
              partyToAlias={partyToAlias}
              workProposals={allWorkProposals}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default MainView;
