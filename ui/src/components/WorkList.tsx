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
} from "semantic-ui-react";
import { ContractId, Party } from "@daml/types";
import { Ledger, CreateEvent } from "@daml/ledger";
import { Work } from "@daml.js/daml-react";
import RejectForm from "./RejectForm";
import EditProposalForm from "./EditProposalForm";
import AcceptOrRejectButtons from "./AcceptOrRejectButtons";
import EditButton from "./EditButton";

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

  const buttonToShow = (isContract: boolean, status: string, contractId: ContractId<Work.WorkProposal | Work.WorkProposal>) => {
    switch (true) {
      case isContract:
        return null;
      case isWorkerList && (status === "Awaiting Review" || status === "Revised - Awaiting Review"):
        return (
          <AcceptOrRejectButtons
            contractId={contractId}
            onAccept={acceptProposal}
            onReject={openRejectForm}
          />
        );
      case isWorkerList && (status === "Rejected"):
        return null;
      default:
        return (
          <EditButton
            contractId={contractId}
            onEdit={openEditForm}
          />
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
              {buttonToShow(isWorkContract, (contract.payload as Work.WorkProposal).status, contract.contractId as ContractId<Work.WorkProposal>)}
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
                jobCategory: null,
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
