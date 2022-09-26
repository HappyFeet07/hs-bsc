import {
  assert,
  describe,
  test,
  clearStore,
  afterAll,
  beforeEach,
  beforeAll
} from "matchstick-as/assembly/index"
import { Address, BigDecimal, BigInt, Bytes, Value } from "@graphprotocol/graph-ts"
import { Approval as ApprovalEvent } from "../generated/HIGH/HIGH"
import { createTransferEvent } from "./high-utils"
import { handleTransfer } from "../src/high"
import { Transfer, HighstreetProperty } from "../generated/schema"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0
let id: string = "0x0000000000000000000000000000000000000001"
let from: string = "0x0000000000000000000000000000000000000123"
let to: string = "0x000000000000000000000000000000000000000234"
let value: string = "1234"
let time: string = "123456789"

describe("Describe Transfer entity assertions", () => {
  beforeEach(() => {
    let TransferEntity = new Transfer(id)
    TransferEntity.from = Bytes.fromHexString(from)
    TransferEntity.to = Bytes.fromHexString(to)
    TransferEntity.value = BigInt.fromString(value)
    TransferEntity.timestamp = BigInt.fromString(time)
    TransferEntity.save()
  })

  afterAll(() => { clearStore() })

  test("Transfer created and stored", () => {
    assert.entityCount("Transfer", 1)
    assert.fieldEquals("Transfer", id, "from", from)
    assert.fieldEquals("Transfer", id, "to", to)
    assert.fieldEquals("Transfer", id, "timestamp", time)
    assert.fieldEquals("Transfer", id, "value", value)
  })
})

let user: string = "0xb31e829f5345f8a767fb9dfd55e594f92f780591"
let highEth: string = "123134134"
let duck: string[] = ["1", "3", "5", "7", "13"]
let assets: string[] = ["100", "300", "500", "700", "1300"]

describe("Describe HighstreetProperty entity assertions", () => {
  beforeEach(() => {
    let TransferEntity = new HighstreetProperty(id)
    TransferEntity.user = Bytes.fromHexString(user)
    TransferEntity.highEth = BigDecimal.fromString(highEth)
    TransferEntity.duck = duck.map<BigInt>((value: string): BigInt => BigInt.fromString(value))
    TransferEntity.assets = assets.map<BigInt>((value: string): BigInt => BigInt.fromString(value))
    TransferEntity.save()
  })

  afterAll(() => { clearStore() })

  test("Transfer created and stored", () => {
    assert.entityCount("HighstreetProperty", 1)
    assert.fieldEquals("HighstreetProperty", id, "user", user)
    assert.fieldEquals("HighstreetProperty", id, "highEth", highEth)
    assert.fieldEquals("HighstreetProperty", id, "duck", "[" + duck.join(", ") + "]")
    assert.fieldEquals("HighstreetProperty", id, "assets", "[" + assets.join(", ") + "]")
  })
})

let sender = "0xcad324acd43a981e801f02e56882a6db47c1eea8"
let receiver = "0xbe29e65a2865958a6377da43ffc0eee9395e06c5"
let amount = "1000" + "000000000000000000"
describe("handleTransfer()", () => {
  beforeAll(() => {
    const transferEvent = createTransferEvent(
      Address.fromString(sender),
      Address.fromString(receiver),
      BigInt.fromString(amount)
    )
    handleTransfer(transferEvent)
  })

  afterAll(() => { clearStore() })

  test("handler should save new transfer event", () => {
    let id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1"
    assert.entityCount("Transfer", 1)
    assert.fieldEquals("Transfer", id, "from", sender)
    assert.fieldEquals("Transfer", id, "to", receiver)
    assert.fieldEquals("Transfer", id, "value", amount)
  })

  describe("HighstreetProptery", () => {
    test("should at least have two entities", () => {
      assert.entityCount("HighstreetProperty", 2)
    })
    test("handler should initialize new HighstreetProperty for sender if not exist", () => {
      assert.fieldEquals("HighstreetProperty", sender, "user", sender)
    })
    test("handler should update highBalance for sender", () => {
      assert.fieldEquals("HighstreetProperty", sender, "highEth", "-1000")
    })
    test("handler should initialize new HighstreetProperty for receiver if not exist", () => {
      assert.fieldEquals("HighstreetProperty", receiver, "user", receiver)
    })
    test("handler should update highBalance for receiver", () => {
      assert.fieldEquals("HighstreetProperty", receiver, "highEth", "1000")
    })
  })

})
