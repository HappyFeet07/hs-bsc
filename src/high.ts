import { Address, BigDecimal, BigInt, Entity } from "@graphprotocol/graph-ts"
import {
  Approval as ApprovalEvent,
  Transfer as TransferEvent
} from "../generated/HIGH/HIGH"
import {
  initializeHsProperty,
  udpateHighBalance,
} from "./common"
import { HighstreetProperty, Transfer } from "../generated/schema"

export function handleTransfer(event: TransferEvent): void {

  let eventEntity = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  eventEntity.from = event.params.from
  eventEntity.to = event.params.to
  eventEntity.value = event.params.value
  eventEntity.timestamp = event.block.timestamp
  eventEntity.save()

  const sender = event.params.from
  const valueInDec = event.params.value.toBigDecimal().div(BigDecimal.fromString("1000000000000000000.0"))

  if (sender != Address.zero()) {
    let senderEntity = HighstreetProperty.load(sender.toHex())
    if (!senderEntity) {
      senderEntity = initializeHsProperty(sender)
    }
    senderEntity = udpateHighBalance(senderEntity, valueInDec, "minus")
    senderEntity.save()
  }

  const receiver = event.params.to
  if (receiver != Address.zero()) {
    let receiverEntity = HighstreetProperty.load(receiver.toHex())
    if (!receiverEntity) {
      receiverEntity = initializeHsProperty(receiver)
    }
    receiverEntity = udpateHighBalance(receiverEntity, valueInDec, "plus")
    receiverEntity.save()
  }
}