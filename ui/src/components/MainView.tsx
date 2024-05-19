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
  ButtonGroup,
} from "semantic-ui-react";
import { Party } from "@daml/types";
import { User } from "@daml.js/daml-react";
import { Work } from "@daml.js/daml-react";
import { publicContext, userContext } from "./App";
import WorkRequestForm from "./WorkRequestForm";
import { WorkRequest } from "../types";
import { Skillset } from "@daml.js/daml-react/lib/Common/module";
import EditSkillsetForm from "./EditSkillsetForm";
import MyRequests from "./MyRequests";
import MyJobs from "./MyJobs";
import ActiveWorkContracts from "./ActiveWorkContracts";

// USERS_BEGIN
const MainView: React.FC = () => {
  const username = userContext.useParty();
  // const myUserResult = userContext.useStreamFetchByKeys(
  //   User.User,
  //   () => [username],
  //   [username]
  // );
  const aliases = publicContext.useStreamQueries(User.Alias, () => [], []);
  const users = publicContext.useStreamQueries(User.User, () => [], []);
  const allUsers = publicContext.useStreamQueries(User.User, () => [], []);
  const allWorkProposals = publicContext.useStreamQueries(
    Work.WorkProposal
  ).contracts;
  const allWorkContracts = publicContext.useStreamQueries(
    Work.WorkContract
  ).contracts;

  // USERS_END
  const [showModal, setShowModal] = useState(false);
  const [showSkillsetModal, setShowSkillsetModal] = useState(false);
  const [view, setView] = useState("");

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

  const mySkillset = users.loading
    ? "loading..."
    : users.contracts[0].payload.skillset;

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
        console.log("Worker Alias: ", workerAlias);
        console.log("Worker Lower Case: ", workerLowercase);
        console.log("alias contracts: ", aliases.contracts);

        console.error("Worker not found.");
        return false;
      }
      console.log("WorkerAlias!: ", workerAlias);
      const workerParty = workerAlias.payload.username;
      const jobCategory = workRequest.jobCategory || Skillset.None;
      const workProposal = await ledger.create(Work.WorkProposal, {
        client: username,
        worker: workerParty,
        jobCategory: jobCategory,
        jobTitle: workRequest.jobTitle,
        jobDescription: workRequest.jobDescription,
        note: workRequest.note,
        rateType: workRequest.rateType,
        rateAmount: workRequest.rateAmount.toString(),
        rejected: workRequest.rejected,
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

  const handleCancelEditSkillset = () => {
    setShowModal(false); // Close the modal when cancel is clicked
  };

  const handleEditSkillset = async (selectedSkillset: Skillset) => {
    console.log("editing skillset!: ", selectedSkillset);
    try {
      const userContractId = users.contracts[0].contractId;
      console.log("userContractId", userContractId);
      await ledger.exercise(User.User.ChangeSkillset, userContractId, {
        newSkillset: selectedSkillset,
      });
      // Update the corresponding Alias contract with the new skillset
      const userAlias = aliases.contracts.find(
        (alias) => alias.payload.username === username
      );
      if (userAlias) {
        const aliasContractId = userAlias.contractId;
        await ledger.exercise(User.Alias.Change, aliasContractId, {
          newAlias: userAlias.payload.alias, // Provide the existing alias
          newSkillset: selectedSkillset,
        });
      }
      setShowSkillsetModal(false);
    } catch (error) {
      console.error("Error editing proposal:", error);
    }
  };

  const toTS_Skillset = (damlSkillset: string): Skillset => {
    switch (damlSkillset) {
      case "Handyman":
        return Skillset.Handyman;
      case "Technology":
        return Skillset.Technology;
      case "Landscaping":
        return Skillset.Landscaping;
      case "Financial":
        return Skillset.Financial;
      case "Housekeeping":
        return Skillset.Housekeeping;
      case "None":
        return Skillset.None;
      default:
        throw new Error(`Unknown skillset: ${damlSkillset}`);
    }
  };

  const formattedUsers = useMemo(() => {
    return aliases.contracts.map((user) => ({
      payload: {
        username: user.payload.username,
        alias: user.payload.alias,
        skillset: toTS_Skillset(user.payload.skillset), // Convert DAML Skillset to TypeScript Skillset
      },
    }));
  }, [aliases]);

  console.log("Aliases: ", aliases);
  console.log("users", users);
  console.log("allUsers", allUsers);
  console.log("allUserAliases: ", allUserAliases);
  console.log("allWorkProposals: ", allWorkProposals);
  console.log("formatted users: ", formattedUsers);

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
                Skillset: {mySkillset ?? "Loading..."}
              </Header>
              <Divider />
              <Button
                type="button"
                color="yellow"
                onClick={() => setShowSkillsetModal(!showSkillsetModal)}
              >
                Edit Skillset
              </Button>
              <Modal
                open={showSkillsetModal}
                onClose={() => setShowSkillsetModal(false)}
                closeIcon
              >
                <Modal.Header>Edit Skillset</Modal.Header>
                <Modal.Content>
                  <EditSkillsetForm
                    onSubmit={handleEditSkillset}
                    onCancel={handleCancelEditSkillset}
                  />
                </Modal.Content>
              </Modal>
            </Segment>

            <Segment>
              <Header as="h2">
                <Icon name="envelope" />
                <Header.Content>Submit a Work Request</Header.Content>
              </Header>
              <Divider />
              <Button
                type="button"
                color="blue"
                onClick={() => setShowModal(!showModal)}
              >
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
                    users={formattedUsers}
                  />
                </Modal.Content>
              </Modal>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <ButtonGroup>
        <Button color="blue" onClick={() => setView("jobView")}>My Jobs</Button>
        <Button color="grey" onClick={() => setView("requestView")}>My Requests</Button>
        <Button color="yellow" onClick={() => setView("contractView")}>Active Contracts</Button>
      </ButtonGroup>
      {view === "requestView" &&
      <MyRequests
        partyToAlias={partyToAlias}
        workProposals={allWorkProposals}
        workContracts={allWorkContracts}
        username={username}
        isWorkerList={false}
        isWorkContract={true}
        ledger={ledger}
      />
  }
      {view === "jobView" && 
      <MyJobs
        partyToAlias={partyToAlias}
        workProposals={allWorkProposals}
        workContracts={allWorkContracts}
        username={username}
        isWorkerList={false}
        isWorkContract={true}
        ledger={ledger}
      />
    }
    {view === "contractView" && 
      <ActiveWorkContracts
        partyToAlias={partyToAlias}
        workProposals={allWorkProposals}
        workContracts={allWorkContracts}
        username={username}
        isWorkerList={false}
        isWorkContract={true}
        ledger={ledger}
      />
  }
    </Container>
  );
};

export default MainView;
