import { ethereum, BigInt } from "@graphprotocol/graph-ts";
import { LenderLiquidityUpdated as LenderLiquidityUpdatedEvent } from "../generated/credlink/credlink";
import { LenderLiquidityUpdated } from "../generated/schema";

function createEventID(lender: string, token: string): string {
  return lender
    .toLowerCase()
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

  let id = createEventID(lender, token);
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
