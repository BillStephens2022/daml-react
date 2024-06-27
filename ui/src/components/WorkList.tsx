// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";
import {
  Segment,
  Header,
  Divider,
  Grid,
  Icon,
  Modal,
  Button,
} from "semantic-ui-react";
import { ContractId, Party } from "@daml/types";
import { Ledger, CreateEvent, QueryResult } from "@daml/ledger";
import { Work } from "@daml.js/daml-react";
import { UserWallet } from "@daml.js/daml-react";
import RejectForm from "./RejectForm";
import EditProposalForm from "./EditProposalForm";
import ContractButton from "./ContractButton";

type Props = {
  partyToAlias: Map<Party, string>;
  workProposals: readonly CreateEvent<Work.WorkProposal, undefined, string>[];
  workContracts: readonly CreateEvent<Work.WorkContract, undefined, string>[];
  wallets: QueryResult<UserWallet.UserWallet, string, string>;
  username: string;
  isWorkerList: boolean;
  isWorkContract: boolean;
  ledger: Ledger;
};

const WorkList: React.FC<Props> = ({
  partyToAlias,
  workProposals,
  workContracts,
  wallets,
  username,
  isWorkerList,
  isWorkContract,
  ledger,
}) => {
  // state for modal showing the Reject Proposal Form
  const [showRejectForm, setShowRejectForm] = useState(false);
  // state for modal showing the Work Request Form - for editing existing request
  const [showEditProposalForm, setShowEditProposalForm] = useState(false);
  // id of proposal selected
  const [selectedProposalId, setSelectedProposalId] =
    useState<ContractId<Work.WorkProposal> | null>(null);
  // selected proposal to edit
  const [selectedProposal, setSelectedProposal] = useState<CreateEvent<
    Work.WorkProposal,
    undefined,
    string
  > | null>(null);
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

  const contractHeaders = ["Accepted Work Contracts", "Active Contracts"];

  // Determine which headers, contracts to use based on isWorkContracct & isWorkerList
  const headersToUse = isWorkContract
    ? contractHeaders
    : isWorkerList
    ? workerHeaders
    : clientHeaders;

  const contractsToUse = isWorkContract
    ? workContracts
    : isWorkerList
    ? workerProposals
    : clientProposals;

  const acceptProposal = async (contractId: ContractId<Work.WorkProposal>) => {
    try {
      await ledger.exercise(Work.WorkProposal.AcceptProposal, contractId, {});
      console.log("Proposal accepted:", contractId);
      // Optionally, you can reload or update the list of proposals after accepting
    } catch (error) {
      console.error("Error accepting proposal:", error);
    }
  };

  const openRejectForm = (contractId: ContractId<Work.WorkProposal>) => {
    setSelectedProposalId(contractId); // Set the selected proposal ID
    setShowRejectForm(true);
  };

  const openEditForm = (contractId: ContractId<Work.WorkProposal>) => {
    const proposal = workProposals.find(
      (proposal) => proposal.contractId === contractId
    );

    if (proposal) {
      setSelectedProposal(proposal);
      setSelectedProposalId(contractId);
      setShowEditProposalForm(true);
    } else {
      console.error("Proposal not found");
    }
  };

  const handleRejectProposal = async (feedback: string) => {
    console.log("Before try block in rejectPRoposal handler: ", feedback);
    try {
      if (selectedProposalId) {
        await ledger.exercise(
          Work.WorkProposal.RejectProposal,
          selectedProposalId,
          { feedback }
        );
        console.log("Proposal rejected:", selectedProposalId);
        setShowRejectForm(false);
        setSelectedProposalId(null);
      }
    } catch (error) {
      console.error("Error rejecting proposal:", error);
    }
  };

  const handleEditProposal = async (formData: any) => {
    console.log("Edit formData: ", formData);
    try {
      if (selectedProposalId && selectedProposal) {
        const {
          jobCategory,
          jobTitle,
          jobDescription,
          note,
          rateType,
          rateAmount,
        } = formData;
        const revisedJobCategory =
          jobCategory ?? selectedProposal.payload.jobCategory;
        const revisedJobTitle = jobTitle ?? selectedProposal.payload.jobTitle;
        const revisedJobDescription =
          jobDescription ?? selectedProposal.payload.jobDescription;
        const feedbackText = note ?? selectedProposal.payload.note;
        const adjustedRateType = rateType ?? selectedProposal.payload.rateType;
        const adjustedRateAmount = parseFloat(
          rateAmount ?? selectedProposal.payload.rateAmount
        );

        await ledger.exercise(
          Work.WorkProposal.ReviseProposal,
          selectedProposalId,
          {
            revisedJobCategory,
            revisedJobTitle,
            revisedJobDescription,
            feedbackText,
            adjustedRateType,
            adjustedRateAmount: adjustedRateAmount.toString(), // Convert to string for Decimal
          }
        );

        setShowEditProposalForm(false);
        setSelectedProposalId(null);
      }
    } catch (error) {
      console.error("Error editing proposal:", error);
    }
  };

  const handleCancelProposal = async (
    contractId: ContractId<Work.WorkProposal>
  ) => {
    try {
      const latestProposals = await ledger.query(Work.WorkProposal);
      const proposal = latestProposals.find(
        (proposal) => proposal.contractId === contractId
      );

      if (!proposal) {
        console.error("Proposal not found or already archived");
        return;
      }

      console.log("Proposal found! ", proposal);
      // Verify if the contract is active
      const isContractActive = await ledger.fetch(
        Work.WorkProposal,
        contractId
      );

      if (!isContractActive) {
        console.error("Contract is not active, cannot cancel.");
        return;
      }

      await ledger.exercise(
        Work.WorkProposal.CancelProposal,
        proposal.contractId,
        {}
      );
    } catch (error) {
      console.error("Error canceling proposal:", error);
    }
  };

  const authorizeClient = async (
    workerWalletCid: ContractId<UserWallet.UserWallet>,
    client: Party
  ) => {
    try {
      await ledger.exercise(
        UserWallet.UserWallet.AuthorizeParty,
        workerWalletCid,
        { partyToAuthorize: client }
      );
      console.log("Client authorized successfully.");
    } catch (error) {
      console.error("Error authorizing client:", error);
    }
  };

  const handleCompleteJob = async (
    contractId: ContractId<Work.WorkContract>
  ) => {
    try {
      // Fetch the contract details
      const contract = await ledger.fetch(Work.WorkContract, contractId);

      if (!contract) {
        console.error("Contract not found:", contractId);
        return;
      }

      // Check if the contract is active
      if (
        contract.payload.contractStatus !==
        "Active Contract - Awaiting Work Completion"
      ) {
        console.error("Contract is not active, cannot complete job.");
        return;
      }

      await ledger.exercise(Work.WorkContract.CompleteJob, contractId, {});

      const workerWallet = wallets.contracts.find(
        (wallet) => wallet.payload.username === contract.payload.contractWorker
      );

      if (!workerWallet) {
        console.error(
          "Worker's wallet not found:",
          contract.payload.contractWorker
        );
        return;
      }

      console.log("Worker's wallet found! ", workerWallet);

      // Add the client as an observer to the worker's wallet, this will allow the client to make the payment to the worker
      const [newContractId] = await ledger.exercise(
        UserWallet.UserWallet.AddObserver,
        workerWallet.contractId,
        {
          newObserver: contract.payload.contractClient,
        }
      );

      // Refetch the worker's wallet to confirm the observer update
      let updatedWorkerWallet = await ledger.fetch(
        UserWallet.UserWallet,
        newContractId
      );

      if (!updatedWorkerWallet) {
        console.error("Failed to refetch updated worker's wallet");
        return;
      }

      console.log(
        "Worker's wallet found and updated with observer! ",
        updatedWorkerWallet
      );

      // Authorize the client to make the payment
      const [updatedContractId] = await ledger.exercise(
        UserWallet.UserWallet.AuthorizeParty,
        updatedWorkerWallet.contractId,
        {
          partyToAuthorize: contract.payload.contractClient,
        }
      );
      // Refetch the worker's wallet to confirm the observer update
      updatedWorkerWallet = await ledger.fetch(
        UserWallet.UserWallet,
        workerWallet.contractId
      );

      if (!updatedWorkerWallet) {
        console.error(
          "Failed to refetch final worker's wallet after adding authorizer:",
          workerWallet.contractId
        );
        return;
      }

      console.log(
        "Client added as authorizer to worker's wallet successfully: ",
        updatedWorkerWallet
      );

      console.log("Job completed:", contractId);
    } catch (error) {
      console.error("Error completing job:", error);
    }
  };

  const handlePayment = async (contractId: ContractId<Work.WorkContract>) => {
    try {
      console.log("Fetching contract with ID:", contractId);

      const contract = await ledger.fetch(Work.WorkContract, contractId);

      if (!contract) {
        console.error("Contract is not active, cannot make a payment.");
        return;
      }

      const paymentAmount = contract.payload.contractRateAmount;
      console.log("Contract to make payment on: ", contract);

      // Find the client's wallet contract
      const clientWallet = wallets.contracts.find(
        (wallet) => wallet.payload.username === contract.payload.contractClient
      );

      // Ensure client's wallet is loaded
      if (!clientWallet) {
        console.error("Client wallet not found.");
        return;
      }

      const clientWalletCid = clientWallet.contractId;

      // Find the worker's wallet contract
      const workerWallet = wallets.contracts.find(
        (wallet) => wallet.payload.username === contract.payload.contractWorker
      );

      // Ensure worker's wallet is loaded
      if (!workerWallet) {
        console.error("Worker wallet not found.");
        return;
      }

      const workerWalletCid = workerWallet.contractId;

      // console.log("username:", username);
      // console.log(
      //   "Worker Wallet observers before payment:",
      //   workerWallet.payload.observers
      // );

      // console.log(workerWallet.payload.observers.includes(username));
      // if (!workerWallet.payload.observers.includes(username)) {
      //   console.error("Client is not an observer on the worker's wallet.");
      //   return;
      // }

      console.log("Preparing to make payment...");

      // Make the payment
      await ledger.exercise(Work.WorkContract.MakeContractPayment, contractId, {
        clientWalletCid,
        workerWalletCid,
        amount: paymentAmount,
      });

      console.log("Payment made successfully:", contractId);
    } catch (error) {
      console.error("Error making payment:", error);
    }
  };

  const buttonToShow = (
    isContract: boolean,
    proposalStatus: string | null,
    contractStatus: string | null,
    worker: string | null,
    contractId: ContractId<Work.WorkProposal> | ContractId<Work.WorkContract>
  ) => {
    switch (true) {
      case isWorkerList &&
        (proposalStatus === "Awaiting Review" ||
          proposalStatus === "Revised - Awaiting Review"):
        return (
          <Button.Group fluid>
            <ContractButton
              contractId={contractId as ContractId<Work.WorkProposal>}
              onAction={acceptProposal}
              actionLabel="Accept"
              color="blue"
            />
            <Button.Or />
            <ContractButton
              contractId={contractId as ContractId<Work.WorkProposal>}
              onAction={openRejectForm}
              actionLabel="Reject"
              color="red"
            />
          </Button.Group>
        );
      case worker === username &&
        isContract &&
        contractStatus === "Active Contract - Awaiting Work Completion":
        return (
          <ContractButton
            contractId={contractId as ContractId<Work.WorkContract>}
            onAction={handleCompleteJob}
            color="blue"
            actionLabel="Complete Job"
          />
        );
      case worker !== username &&
        isContract &&
        contractStatus === "Active Contract - Awaiting Work Completion":
        return null;
      case worker !== username &&
        isContract &&
        contractStatus === "Work Completed, Awaiting Payment":
        return (
          <ContractButton
            contractId={contractId as ContractId<Work.WorkContract>}
            onAction={() =>
              handlePayment(contractId as ContractId<Work.WorkContract>)
            }
            color="green"
            actionLabel="Make Payment"
          />
        );
      case worker === username &&
        isContract &&
        contractStatus === "Work Completed, Awaiting Payment":
        return null;
      case isWorkerList && proposalStatus === "Rejected":
        return null;

      default:
        return (
          <Button.Group fluid>
            <ContractButton
              contractId={contractId as ContractId<Work.WorkProposal>}
              onAction={openEditForm}
              color="yellow"
              actionLabel="Edit"
            />
            <Button.Or />
            <ContractButton
              contractId={contractId as ContractId<Work.WorkProposal>}
              onAction={handleCancelProposal}
              color="red"
              actionLabel="Cancel"
            />
          </Button.Group>
        );
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
              <Header as="h3">
                {isWorkContract
                  ? (contract.payload as Work.WorkContract).contractJobTitle
                  : (contract.payload as Work.WorkProposal).jobTitle}
              </Header>
              <p>
                <strong>Client:</strong>{" "}
                {partyToAlias.get(
                  isWorkContract
                    ? (contract.payload as Work.WorkContract).contractClient
                    : (contract.payload as Work.WorkProposal).client
                ) ?? "Unknown"}
              </p>
              <p>
                <strong>Worker:</strong>{" "}
                {partyToAlias.get(
                  isWorkContract
                    ? (contract.payload as Work.WorkContract).contractWorker
                    : (contract.payload as Work.WorkProposal).worker
                ) ?? "Unknown"}
              </p>
              <p>
                <strong>Category:</strong>{" "}
                {isWorkContract
                  ? (contract.payload as Work.WorkContract).contractJobCategory
                  : (contract.payload as Work.WorkProposal).jobCategory}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {isWorkContract
                  ? (contract.payload as Work.WorkContract)
                      .contractJobDescription
                  : (contract.payload as Work.WorkProposal).jobDescription}
              </p>
              <p>
                <strong>Note:</strong>{" "}
                {isWorkContract
                  ? null
                  : (contract.payload as Work.WorkProposal).note}
              </p>
              <p>
                <strong>Rate Type:</strong>{" "}
                {isWorkContract
                  ? (contract.payload as Work.WorkContract).contractRateType
                  : (contract.payload as Work.WorkProposal).rateType}
              </p>
              <p>
                <strong>Rate Amount:</strong>{" "}
                {isWorkContract
                  ? (contract.payload as Work.WorkContract).contractRateAmount
                  : (contract.payload as Work.WorkProposal).rateAmount}
              </p>
              <p>
                <strong>Status</strong>{" "}
                {isWorkContract
                  ? (contract.payload as Work.WorkContract).contractStatus
                  : (contract.payload as Work.WorkProposal).status}
              </p>
              {buttonToShow(
                isWorkContract,
                (contract.payload as Work.WorkProposal).status,
                (contract.payload as Work.WorkContract).contractStatus,
                (contract.payload as Work.WorkContract).contractWorker,
                contract.contractId as ContractId<Work.WorkProposal>
              )}
            </Segment>
          </Grid.Column>
        ))}
      </Grid>
      <Modal
        open={showRejectForm}
        onClose={() => {
          setShowRejectForm(false);
          setSelectedProposalId(null);
        }}
      >
        <Modal.Header>Reject Proposal</Modal.Header>
        <Modal.Content>
          <RejectForm
            onSubmit={(feedback) => handleRejectProposal(feedback)}
            onCancel={() => setShowRejectForm(false)}
          />
        </Modal.Content>
      </Modal>
      <Modal
        open={showEditProposalForm}
        onClose={() => {
          setShowEditProposalForm(false);
          setSelectedProposalId(null);
        }}
      >
        <Modal.Header>Edit Work Proposal</Modal.Header>
        <Modal.Content>
          {selectedProposal && (
            <EditProposalForm
              onSubmit={handleEditProposal}
              onCancel={() => setShowEditProposalForm(false)}
              initialValues={{
                client: selectedProposal.payload?.client ?? "",
                worker: selectedProposal.payload?.worker ?? "",
                jobCategory: selectedProposal.payload?.jobCategory ?? "",
                jobTitle: selectedProposal.payload?.jobTitle ?? "",
                jobDescription: selectedProposal.payload?.jobDescription ?? "",
                note: selectedProposal.payload?.note ?? "",
                rateType: selectedProposal.payload?.rateType ?? "",
                // Convert rateAmount to a number
                rateAmount: parseFloat(
                  selectedProposal.payload?.rateAmount ?? "0"
                ),
                status: selectedProposal.payload?.status ?? "",
              }}
            />
          )}
        </Modal.Content>
      </Modal>
    </Segment>
  );
};

export default WorkList;
