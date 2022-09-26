import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  DuckNFTApproval as DuckNFTApprovalEvent,
  DuckNFTApprovalForAll as DuckNFTApprovalForAllEvent,
  DuckNFTOwnershipTransferred as DuckNFTOwnershipTransferredEvent,
  DuckNFTTransfer as DuckNFTTransferEvent
} from "../generated/DuckNFT/DuckNFT"
import {
  DuckNFTTransfer, HighstreetProperty, DuckOwner
} from "../generated/schema"
import {
  initializeHsProperty,
  updateDuckInProperty
} from "./common"

export function handleDuckNFTTransfer(event: DuckNFTTransferEvent): void {

  let eventEntity = new DuckNFTTransfer(
    event.transaction.hash.toHex() + "-NFTTransfer-" + event.logIndex.toString()
  )
  eventEntity.from = event.params.from
  eventEntity.to = event.params.to
  eventEntity.tokenId = event.params.tokenId
  eventEntity.timestamp = event.block.timestamp
  eventEntity.save()

  let sender = event.params.from
  let receiver = event.params.to

  // contract address + tokenId
  const id = event.transaction.to!.toHex() + "-" + event.params.tokenId.toString()
  let ownerEntity = DuckOwner.load(id)
  if (sender !== Address.zero()) {
    if (!ownerEntity) {
      ownerEntity = new DuckOwner(id)
    }
    ownerEntity.amount = BigInt.fromString("1")
    ownerEntity.tokenId = event.params.tokenId
    ownerEntity.owner = receiver
  }
  ownerEntity!.save()

  if (sender != Address.zero()) {
    let senderEntity = HighstreetProperty.load(sender.toHex())
    if (!senderEntity) {
      senderEntity = initializeHsProperty(sender)
    } else {
      senderEntity = updateDuckInProperty(senderEntity, [event.params.tokenId], false)
    }
    senderEntity.save()
  }

  let receiverEntity = HighstreetProperty.load(receiver.toHex())
  if (!receiverEntity) {
    receiverEntity = initializeHsProperty(receiver)
  }
  receiverEntity = updateDuckInProperty(receiverEntity, [event.params.tokenId], true)
  receiverEntity.save()
}
