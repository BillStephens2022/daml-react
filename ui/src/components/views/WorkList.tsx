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
import { Work, UserWallet, Payment } from "@daml.js/daml-react";
import RejectForm from "../forms/RejectForm";
import EditProposalForm from "../forms/EditProposalForm";
import ContractButton from "../ui/ContractButton";

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

  // Determine which headers, contracts to use based on isWorkContract & isWorkerList
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
    } catch (error) {
      console.error("Error accepting proposal:", error);
    }
  };

  const openRejectForm = (contractId: ContractId<Work.WorkProposal>) => {
    setSelectedProposalId(contractId);
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
    try {
      if (selectedProposalId) {
        await ledger.exercise(
          Work.WorkProposal.RejectProposal,
          selectedProposalId,
          { feedback }
        );
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
          totalAmount,
        } = formData;
        const revisedJobCategory =
          jobCategory ?? selectedProposal.payload.jobCategory;
        const revisedJobTitle = jobTitle ?? selectedProposal.payload.jobTitle;
        const revisedJobDescription =
          jobDescription ?? selectedProposal.payload.jobDescription;
        const feedbackText = note ?? selectedProposal.payload.note;
        const adjustedRateType = rateType ?? selectedProposal.payload.rateType;
        const adjustedTotalAmount =
          totalAmount ?? selectedProposal.payload.totalAmount;

        await ledger.exercise(
          Work.WorkProposal.ReviseProposal,
          selectedProposalId,
          {
            revisedJobCategory,
            revisedJobTitle,
            revisedJobDescription,
            feedbackText,
            adjustedRateType,
            adjustedTotalAmount,
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

      // const workerWallet = wallets.contracts.find(
      //   (wallet) => wallet.payload.username === contract.payload.contractWorker
      // );

      // if (!workerWallet) {
      //   console.error(
      //     "Worker's wallet not found:",
      //     contract.payload.contractWorker
      //   );
      //   return;
      // }

      // // Add the client as an observer to the worker's wallet, this will allow the client to make the payment to the worker
      // const [newContractId] = await ledger.exercise(
      //   UserWallet.UserWallet.AddObserver,
      //   workerWallet.contractId,
      //   {
      //     newObserver: contract.payload.contractClient,
      //   }
      // );

      // // Refetch the worker's wallet to confirm the observer update
      // let updatedWorkerWallet = await ledger.fetch(
      //   UserWallet.UserWallet,
      //   newContractId
      // );

      // if (!updatedWorkerWallet) {
      //   console.error("Failed to refetch updated worker's wallet");
      //   return;
      // }

      // Authorize the client to make the payment
      // const [updatedContractId] = await ledger.exercise(
      //   UserWallet.UserWallet.AuthorizeParty,
      //   updatedWorkerWallet.contractId,
      //   {
      //     partyToAuthorize: contract.payload.contractClient,
      //   }
      // );

      // Refetch the worker's wallet to confirm the observer update
      //   updatedWorkerWallet = await ledger.fetch(
      //     UserWallet.UserWallet,
      //     updatedContractId
      //   );

      //   if (!updatedWorkerWallet) {
      //     console.error(
      //       "Failed to refetch final worker's wallet after adding authorizer:",
      //       workerWallet.contractId
      //     );
      //     return;
      //   }
    } catch (error) {
      console.error("Error completing job:", error);
    }
  };

  const handlePayment = async (contractId: ContractId<Work.WorkContract>) => {
    try {
      const contract = await ledger.fetch(Work.WorkContract, contractId);
  
      if (!contract) {
        console.error("Contract is not active, cannot make a payment.");
        return;
      }
  
      const paymentAmount = contract.payload.contractTotalAmount;
      const contractClient = contract.payload.contractClient;
      const contractWorker = contract.payload.contractWorker;
  
      // Fetch the client's wallet
      const clientWallet = wallets.contracts.find(
        (wallet) => wallet.payload.username === contractClient
      );
  
      if (!clientWallet) {
        console.error("Client wallet not found.");
        return;
      }
  
      const clientWalletCid = clientWallet.contractId;
  
      // Create a Payment contract and initiate payment
      const paymentCreateEvent = await ledger.create(Payment.Payment, {
        client: contractClient,
        worker: contractWorker,
        amount: paymentAmount,
        clientWalletCid: clientWalletCid,
        // You don't need to pass the worker wallet, as the ledger will handle it
      });
  
      const paymentContractId = paymentCreateEvent.contractId;
  
      // Exercise MakePayment on the Payment contract
      await ledger.exercise(Payment.Payment.MakePayment, paymentContractId, {});
  
      console.log("Payment successfully made!");
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
      case contractStatus === "Paid":
        return <p>Contract completed. Paid in full.</p>;

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
                      .tag === "HourlyRate"
                    ? "Hourly Rate"
                    : "Flat Fee"
                  : (contract.payload as Work.WorkProposal).rateType.tag ===
                    "HourlyRate"
                  ? "Hourly Rate"
                  : "Flat Fee"}
              </p>
              {isWorkContract ? (
                (contract.payload as Work.WorkContract).contractRateType.tag ===
                "HourlyRate" ? (
                  <p>
                    <strong>Number of Hours: </strong>
                    {
                      (contract.payload as Work.WorkContract).contractRateType
                        .value.hours
                    }
                  </p>
                ) : null
              ) : (contract.payload as Work.WorkProposal).rateType.tag ===
                "HourlyRate" ? (
                <p>
                  <strong>Number of Hours: </strong>
                  {(contract.payload as Work.WorkProposal).rateType.value.hours}
                </p>
              ) : null}
              {isWorkContract ? (
                (contract.payload as Work.WorkContract).contractRateType.tag ===
                "HourlyRate" ? (
                  <p>
                    <strong>Hourly Rate: </strong>
                    {
                      (contract.payload as Work.WorkContract).contractRateType
                        .value.rate
                    }{" "}
                    /hour
                  </p>
                ) : null
              ) : (contract.payload as Work.WorkProposal).rateType.tag ===
                "HourlyRate" ? (
                <p>
                  <strong>Hourly Rate: </strong>
                  {
                    (contract.payload as Work.WorkProposal).rateType.value.rate
                  }{" "}
                  / hour
                </p>
              ) : null}

              <p>
                <strong>Total Amount:</strong>{" "}
                {isWorkContract
                  ? (contract.payload as Work.WorkContract).contractTotalAmount
                  : (contract.payload as Work.WorkProposal).totalAmount}
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
                // Handle rateType dynamically based on its tag
                rateType: {
                  tag: selectedProposal.payload?.rateType.tag,
                  value:
                    selectedProposal.payload?.rateType.tag === "HourlyRate"
                      ? {
                          rate:
                            selectedProposal.payload?.rateType.value.rate ?? 0,
                          hours:
                            selectedProposal.payload?.rateType.value.hours ?? 0,
                        }
                      : {
                          amount:
                            selectedProposal.payload?.rateType.value.amount ??
                            0,
                        },
                } as Work.RateType,
                totalAmount: String(
                  parseFloat(selectedProposal.payload?.totalAmount ?? "0")
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
