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
import { User, Work, UserWallet } from "@daml.js/daml-react";
import { publicContext, userContext } from "../App";
import WorkRequestForm from "../forms/WorkRequestForm";
import { Skillset } from "@daml.js/daml-react/lib/Common/module";
import EditSkillsetForm from "../forms/EditSkillsetForm";
import DepositForm from "../forms/DepositForm";
import ContractsView from "./ContractsView";
import CommunityList from "./CommunityList";
import HeaderSubHeader from "semantic-ui-react/dist/commonjs/elements/Header/HeaderSubheader";
import classes from "../../styles/MainView.module.css";


const MainView: React.FC = () => {
  const username = userContext.useParty();
  const aliases = publicContext.useStreamQueries(User.Alias, () => [], []);
  const users = publicContext.useStreamQueries(User.User, () => [], []);
  const userWallets = publicContext.useStreamQueries(
    UserWallet.UserWallet,
    () => [],
    []
  );
  const allWorkProposals = publicContext.useStreamQueries(
    Work.WorkProposal
  ).contracts;
  const allWorkContracts = publicContext.useStreamQueries(
    Work.WorkContract
  ).contracts;

  const [showModal, setShowModal] = useState(false);
  const [showSkillsetModal, setShowSkillsetModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

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

  const formattedAliases = useMemo(() => {
    return aliases.contracts.map((alias) => ({
      username: alias.payload.username,
      alias: alias.payload.alias,
      skillset: alias.payload.skillset,
    }));
  }, [aliases]);

  const myUserName = aliases.loading
    ? "loading ..."
    : partyToAlias.get(username) ?? username;

  const mySkillset = users.loading
    ? "loading..."
    : users.contracts[0].payload.skillset;

  const myWallet = userWallets.loading
    ? "loading..."
    : userWallets.contracts[0]?.payload.walletBalance;

  // Function to submit a new work request to the DAML ledger
  const submitWorkRequest = async (workRequest: Work.WorkProposal) => {
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

      const workerParty = workerAlias.payload.username;
      const jobCategory = workRequest.jobCategory || Skillset.None;
      

      await ledger.create(Work.WorkProposal, {
        client: username,
        worker: workerParty,
        jobCategory: jobCategory,
        jobTitle: workRequest.jobTitle,
        jobDescription: workRequest.jobDescription,
        note: workRequest.note,
        rateType: workRequest.rateType,
        totalAmount: workRequest.totalAmount,
        status: workRequest.status,
      });

      return true;

    } catch (error) {
      console.error("Error creating work proposal:", error);
      return false;
    }
  };

  // Function to handle submission of work request form
  const handleSubmitWorkRequest = (workRequest: Work.WorkProposal) => {
    submitWorkRequest(workRequest).then((success) => {
      if (success) {
        setShowModal(false); // Close the modal after submission
      }
    });
  };

  const handleCancelWorkRequest = () => {
    setShowModal(false); // Close the modal when cancel is clicked
  };

  const handleCancelEditSkillset = () => {
    setShowModal(false); // Close the modal when cancel is clicked
  };

  const handleCancelDeposit = () => {
    setShowDepositModal(false); // Close the modal when cancel is clicked
  };

  const handleEditSkillset = async (selectedSkillset: Skillset) => {
    try {
      const userContractId = users.contracts[0].contractId;
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

  const handleDeposit = async (depositAmount: number) => {
    try {
      const userWalletContractId = userWallets.contracts[0].contractId;

      await ledger.exercise(
        UserWallet.UserWallet.DepositFunds,
        userWalletContractId,
        {
          depositAmount: depositAmount.toString(),
        }
      );
      setShowDepositModal(false);
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
      case "Babysitting":
        return Skillset.Babysitting;
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

  return (
    <Container className={classes.mainView}>
      <Grid centered columns={1}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header
              as="h1"
              size="huge"
              inverted
              textAlign="center"
              style={{ padding: "1ex 0em 0ex 0em" }}
            >
              {myUserName ? `Welcome, ${myUserName}!` : "Loading..."}
            </Header>

            <Segment>
              <Header as="h2">
                <Header.Content>
                  <Icon name="user" className={classes.headerIcon} />
                  <Header.Content>{myUserName ?? "Loading..."}</Header.Content>
                  <HeaderSubHeader className={classes.skillset}>
                    Skillset: {mySkillset ?? "Loading..."}
                  </HeaderSubHeader>
                  <HeaderSubHeader className={classes.skillset}>
                    Wallet Balance: $ {myWallet ?? "Loading..."}
                  </HeaderSubHeader>
                </Header.Content>
              </Header>
              <Divider />
              <Button.Group>
                <Button
                  type="button"
                  color="yellow"
                  onClick={() => setShowSkillsetModal(!showSkillsetModal)}
                >
                  Edit Skillset
                </Button>
                <Button.Or />
                <Button
                  type="button"
                  color="green"
                  onClick={() => setShowDepositModal(!showDepositModal)}
                >
                  Deposit Funds
                </Button>
              </Button.Group>
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
              <Modal
                open={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                closeIcon
              >
                <Modal.Header>Deposit Funds</Modal.Header>
                <Modal.Content>
                  <DepositForm
                    onSubmit={handleDeposit}
                    onCancel={handleCancelDeposit}
                  />
                </Modal.Content>
              </Modal>
            </Segment>
            <Segment>
              <CommunityList aliases={formattedAliases} />
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
      <ContractsView 
        partyToAlias={partyToAlias}
        workProposals={allWorkProposals}
        workContracts={allWorkContracts}
        wallets={userWallets}
        username={username}
        isWorkerList={false}
        isWorkContract={true}
        ledger={ledger} 
      />
    </Container>
  );
};

export default MainView;