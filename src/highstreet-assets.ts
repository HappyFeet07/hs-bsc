import { Address, BigInt, Entity } from "@graphprotocol/graph-ts"
import {
  TransferBatch as TransferBatchEvent,
  TransferSingle as TransferSingleEvent,
} from "../generated/HighstreetAssets/HighstreetAssets"
import {
  initializeHsProperty,
  updateAssetInProperty
} from "./common"
import {
  HighstreetProperty, 
  AssetsTransferBatch,
  AssetsTransferSingle
} from "../generated/schema"

export function handleTransferBatch(event: TransferBatchEvent): void {

  let eventEntity = new AssetsTransferBatch(
    event.transaction.hash.toHex() + "-AssetsTransfer-" + event.logIndex.toString()
  )
  eventEntity.from = event.params.from
  eventEntity.to = event.params.to
  eventEntity.ids = event.params.ids
  eventEntity.amounts = event.params.values
  eventEntity.timestamp = event.block.timestamp
  eventEntity.save()

  const sender = event.params.from
  if (sender != Address.zero()) {
    let senderEntity = HighstreetProperty.load(sender.toHex())
    if (!senderEntity) {
      senderEntity = initializeHsProperty(sender)
    } else {
      senderEntity = updateAssetInProperty(senderEntity, event.params.ids, false)
    }
    senderEntity.save()
  }

  const receiver = event.params.to
  let receiverEntity = HighstreetProperty.load(receiver.toHex())
  if (!receiverEntity) {
    receiverEntity = initializeHsProperty(receiver)
  }
  receiverEntity = updateAssetInProperty(receiverEntity, event.params.ids, true)
  receiverEntity.save()
  
  /*for (let i = 0; i < event.params.ids.length; i++) {
    let id = event.transaction.to!.toHex() + event.params.to.toHex() + event.params.ids[i]
    let OwnerEntity = NFTOwner.load(id)
    if (!OwnerEntity) {
      OwnerEntity = new NFTOwner(id)
      OwnerEntity.collections = "Highstreet-assets"
      OwnerEntity.tokenId = event.params.ids[i]
    }
    OwnerEntity.amount = parseInt(event.params.values[i].toString())
    OwnerEntity.save()
  }*/
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  let eventEntity = new AssetsTransferSingle(
    event.transaction.hash.toHex() + "-AssetsTransfer-" + event.logIndex.toString()
  )
  eventEntity.from = event.params.from
  eventEntity.to = event.params.to
  eventEntity.tokenId = event.params.id
  eventEntity.amount = event.params.value
  eventEntity.timestamp = event.block.timestamp
  eventEntity.save()

  const sender = event.params.from
  if (sender != Address.zero()) {
    let senderEntity = HighstreetProperty.load(sender.toHex())
    if (!senderEntity) {
      senderEntity = initializeHsProperty(sender)
    } else {
      senderEntity = updateAssetInProperty(senderEntity, [event.params.id], false)
    }
    senderEntity.save()
  }

  const receiver = event.params.to
  let receiverEntity = HighstreetProperty.load(receiver.toHex())
  if (!receiverEntity) {
    receiverEntity = initializeHsProperty(receiver)
  }
  receiverEntity = updateAssetInProperty(receiverEntity, [event.params.id], true)
  receiverEntity.save()
}
