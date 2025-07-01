import assert from "assert";
import {
  CharityAddedLog,
  DonatedLog,
  OwnershipTransferredLog,
  PointsAddedLog,
  PointsRedeemedLog,
  SetOracleLog,
} from "../types/abi-interfaces/Abi";

import {
  ProposalCanceledLog,
  ProposalCreatedLog,
  ProposalExecutedLog,
  ProposalQueuedLog,
  VoteCastLog,
  VoteCastWithParamsLog,
} from "../types/abi-interfaces/Governor";

import {
  Donation,
  PointsAdded,
  PointsRedeemed,
  OrocleUpdate,
  OwnershipTransfer,
  CharityAdded,
  ProposalCanceled,
  ProposalCreated,
  ProposalExecuted,
  ProposalQueued,
  VoteCast,
} from "../types";

const ProposalState = {
  Pending: 0,
  Active: 1,
  Canceled: 2,
  Defeated: 3,
  Succeeded: 4,
  Queued: 5,
  Expired: 6,
  Executed: 7,
};

enum VoteSupport {
  Against,
  For,
}

export async function handleVoteCastWithParamsAbiLog(
  log: VoteCastWithParamsLog
) {
  logger.info(`New VoteCast transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const proposal = await ProposalCreated.get(log.args.proposalId.toString());

  if (!proposal) {
    logger.error("Proposal not found");
    return;
  }

  if (log.args.support === VoteSupport.For) {
    proposal.votesFor += BigInt(1);
    proposal.weightVotesFor += log.args.weight.toBigInt();
  } else if (log.args.support === VoteSupport.Against) {
    proposal.votesAgainst += BigInt(1);
    proposal.weightVotesAgainst += log.args.weight.toBigInt();
  }

  await proposal.save();
}

export async function handleVoteCastAbiLog(log: VoteCastLog) {
  logger.info(`New VoteCast transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const proposal = await ProposalCreated.get(log.args.proposalId.toString());

  if (!proposal) {
    logger.error("Proposal not found");
    return;
  }

  if (log.args.support === VoteSupport.For) {
    proposal.votesFor += BigInt(1);
    proposal.weightVotesFor += log.args.weight.toBigInt();
  } else if (log.args.support === VoteSupport.Against) {
    proposal.votesAgainst += BigInt(1);
    proposal.weightVotesAgainst += log.args.weight.toBigInt();
  }

  await proposal.save();
}

export async function handleProposalCanceledAbiLog(
  log: ProposalCanceledLog
): Promise<void> {
  logger.info(
    `New ProposalCanceled transaction log at block ${log.blockNumber}`
  );
  assert(log.args, "No log.args");
  const proposal = await ProposalCreated.get(log.args.proposalId.toString());

  if (!proposal) {
    logger.error("Proposal not found");
    return;
  }

  proposal.state = BigInt(ProposalState.Canceled);
  proposal.canceledTimeStamp = log.block.timestamp;
  await proposal.save();
}

export async function handleProposalExecutedAbiLog(
  log: ProposalExecutedLog
): Promise<void> {
  logger.info(
    `New ProposalExecuted transaction log at block ${log.blockNumber}`
  );
  assert(log.args, "No log.args");
  const proposal = await ProposalCreated.get(log.args.proposalId.toString());

  if (!proposal) {
    logger.error("Proposal not found");
    return;
  }

  proposal.state = BigInt(ProposalState.Executed);
  proposal.executedTimeStamp = log.block.timestamp;
  await proposal.save();
}

export async function handleProposalQueuedAbiLog(
  log: ProposalQueuedLog
): Promise<void> {
  logger.info(`New ProposalQueued transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");
  const proposal = await ProposalCreated.get(log.args.proposalId.toString());

  if (!proposal) {
    logger.error("Proposal not found");
    return;
  }

  proposal.state = BigInt(ProposalState.Queued);
  proposal.etaSecondsQueue = log.args.etaSeconds.toBigInt();
  proposal.queuedTimeStamp = log.block.timestamp;
  await proposal.save();

  const transaction = ProposalQueued.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    proposalId: log.args.proposalId.toBigInt(),
    etaSeconds: log.args.etaSeconds.toBigInt(),
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handleProposalCreatedAbiLog(
  log: ProposalCreatedLog
): Promise<void> {
  logger.info(
    `New ProposalCreated transaction log at block ${log.blockNumber}`
  );
  assert(log.args, "No log.args");
  const transaction = ProposalCreated.create({
    id: log.args.proposalId.toString(),
    blockHeight: BigInt(log.blockNumber),
    proposalId: log.args.proposalId.toBigInt(),
    proposer: log.args.proposer,
    targets: log.args.targets,
    signatures: log.args.signatures,
    calldatas: log.args.calldatas,
    voteStart: log.args.voteStart.toBigInt(),
    voteEnd: log.args.voteEnd.toBigInt(),
    description: log.args.description,
    contractAddress: log.address,
    state: BigInt(ProposalState.Active),
    etaSecondsQueue: BigInt(0),
    votesAgainst: BigInt(0),
    votesFor: BigInt(0),
    weightVotesAgainst: BigInt(0),
    weightVotesFor: BigInt(0),
    createdTimeStamp: log.block.timestamp,
    queuedTimeStamp: BigInt(0),
    executedTimeStamp: BigInt(0),
    canceledTimeStamp: BigInt(0),
  });
  await transaction.save();
}

export async function handleDonatedAbiLog(log: DonatedLog): Promise<void> {
  logger.info(`New Donation transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = Donation.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    user: log.args.user,
    charityCategory: BigInt(log.args.charityCategory),
    token: log.args.token,
    amount: log.args.amount.toBigInt(),
    contractAddress: log.address,
  });

  await transaction.save();
}
export async function handleCharityAddedAbiLog(
  log: CharityAddedLog
): Promise<void> {
  logger.info(`New Donation transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = CharityAdded.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    charityAddress: log.args.charityAddress,
    charityCategory: BigInt(log.args.charityCategory),
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handleOwnershipTransferredAbiLog(
  log: OwnershipTransferredLog
): Promise<void> {
  logger.info(`New Donation transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = OwnershipTransfer.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    previousOwner: log.args.previousOwner,
    newOwner: log.args.newOwner,
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handlePointsAddedAbiLog(
  log: PointsAddedLog
): Promise<void> {
  logger.info(`New PointsAdded transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const userAddress = log.args.user;

  const user = await PointsAdded.getByUser(userAddress, {
    orderDirection: "ASC",
    limit: 1,
  });

  if (user.length > 0) {
    await PointsAdded.remove(user[0].id);
  }

  const transaction = PointsAdded.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    user: log.args.user,
    points: log.args.points.toBigInt(),
    updatedTimeStamp: log.block.timestamp,
    createdTimeStamp: log.block.timestamp,
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handlePointsRedeemedAbiLog(
  log: PointsRedeemedLog
): Promise<void> {
  logger.info(`New PointsRedeemed transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = PointsRedeemed.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    user: log.args.user,
    points: log.args.points.toBigInt(),
    contractAddress: log.address,
  });

  await transaction.save();
}

export async function handleSetOracleAbiLog(log: SetOracleLog): Promise<void> {
  logger.info(`New OrocleUpdate transaction log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const transaction = OrocleUpdate.create({
    id: log.transactionHash,
    blockHeight: BigInt(log.blockNumber),
    newOrocle: log.args.newOrocle,
    oldOrocle: log.args.oldOrocle,
    contractAddress: log.address,
  });

  await transaction.save();
}
