import { ethereum, BigInt } from "@graphprotocol/graph-ts";
import {
  LenderLiquidityUpdated as LenderLiquidityUpdatedEvent,
  LoanBorrowed as LoanBorrowedEvent,
} from "../generated/credlink/credlink";
import { LenderLiquidityUpdated, LoanBorrowed } from "../generated/schema";

function createLenderId(lender: string, token: string): string {
  return "lender-"
    .concat(lender.toLowerCase())
    .concat("-")
    .concat(token.toLowerCase());
}

function createBorrowerId(
  borrower: string,
  lender: string,
  token: string
): string {
  return "borrower-"
    .concat(borrower.toLowerCase())
    .concat("-")
    .concat(lender.toLowerCase())
    .concat("-")
    .concat(token.toLowerCase());
}

function createEventIDByBlock(event: ethereum.Event): string {
  return event.block.number
    .toString()
    .concat("-")
    .concat(event.logIndex.toString());
}

export function handleLenderLiquidityUpdate(
  ev: LenderLiquidityUpdatedEvent
): void {
  let lender = ev.params.lender.toHexString();
  let token = ev.params.token.toHexString();

  let id = createLenderId(lender, token);
  let entity = LenderLiquidityUpdated.load(id);

  if (entity == null) {
    entity = new LenderLiquidityUpdated(id);
  }

  entity.lender = ev.params.lender;
  entity.token = ev.params.token;
  entity.availableAmount = ev.params.availableAmount;
  entity.blockNumber = ev.block.number;
  entity.transactionHash = ev.transaction.hash;
  entity.timestamp = ev.block.timestamp;

  entity.save();
}

export function handleLoanBorrowed(ev: LoanBorrowedEvent): void {
  let borrower = ev.params.borrower.toHexString();
  let lender = ev.params.lender.toHexString();
  let token = ev.params.token.toHexString();

  let id = createBorrowerId(borrower, lender, token);
  let entity = LoanBorrowed.load(id);

  if (entity == null) {
    entity = new LoanBorrowed(id);
  }

  entity.borrower = ev.params.borrower;
  entity.lender = ev.params.lender;
  entity.token = ev.params.token;
  entity.amount = ev.params.amount;
  entity.blockNumber = ev.block.number;
  entity.transactionHash = ev.transaction.hash;
  entity.timestamp = ev.block.timestamp;

  entity.save();
}
