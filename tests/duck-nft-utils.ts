import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  DuckNFTApproval,
  DuckNFTApprovalForAll,
  DuckNFTOwnershipTransferred,
  DuckNFTTransfer
} from "../generated/DuckNFT/DuckNFT"

export function createDuckNFTApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): DuckNFTApproval {
  let duckNftApprovalEvent = changetype<DuckNFTApproval>(newMockEvent())

  duckNftApprovalEvent.parameters = new Array()

  duckNftApprovalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  duckNftApprovalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  duckNftApprovalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return duckNftApprovalEvent
}

export function createDuckNFTApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): DuckNFTApprovalForAll {
  let duckNftApprovalForAllEvent = changetype<DuckNFTApprovalForAll>(
    newMockEvent()
  )

  duckNftApprovalForAllEvent.parameters = new Array()

  duckNftApprovalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  duckNftApprovalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  duckNftApprovalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return duckNftApprovalForAllEvent
}

export function createDuckNFTOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): DuckNFTOwnershipTransferred {
  let duckNftOwnershipTransferredEvent = changetype<
    DuckNFTOwnershipTransferred
  >(newMockEvent())

  duckNftOwnershipTransferredEvent.parameters = new Array()

  duckNftOwnershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  duckNftOwnershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return duckNftOwnershipTransferredEvent
}

export function createDuckNFTTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): DuckNFTTransfer {
  let duckNftTransferEvent = changetype<DuckNFTTransfer>(newMockEvent())

  duckNftTransferEvent.parameters = new Array()

  duckNftTransferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  duckNftTransferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  duckNftTransferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return duckNftTransferEvent
}
