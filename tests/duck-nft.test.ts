import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  beforeEach
} from "matchstick-as/assembly/index"
import { Address, bigInt, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { DuckNFTApproval as DuckNFTApprovalEvent } from "../generated/DuckNFT/DuckNFT"
import { createDuckNFTTransferEvent } from "./duck-nft-utils"
import { AssetsOwner, DuckNFTTransfer, DuckOwner } from "../generated/schema"
import { handleDuckNFTTransfer } from "../src/duck-nft"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

let id: string = "0x0000000000000000000000000000000000000001"
let from: string = "0x0000000000000000000000000000000000000123"
let to: string = "0x000000000000000000000000000000000000000234"
let tokenId: string = "1234"
let time: string = "123456789"

describe("Describe DuckNFTTransfer entity assertions", () => {

  beforeAll(() => {
    let DuckNFTTransferEntity = new DuckNFTTransfer(id)
    DuckNFTTransferEntity.from = Bytes.fromHexString(from)
    DuckNFTTransferEntity.to = Bytes.fromHexString(to)
    DuckNFTTransferEntity.tokenId = BigInt.fromString(tokenId)
    DuckNFTTransferEntity.timestamp = BigInt.fromString(time)
    DuckNFTTransferEntity.save()
  })

  afterAll(() => { clearStore() })

  test("DuckNFTTransfer created and stored", () => {
    assert.entityCount("DuckNFTTransfer", 1)
    assert.fieldEquals("DuckNFTTransfer", id, "from", from)
    assert.fieldEquals("DuckNFTTransfer", id, "to", to)
    assert.fieldEquals("DuckNFTTransfer", id, "tokenId",tokenId)
    assert.fieldEquals("DuckNFTTransfer", id, "timestamp", time)
  })
})

let owner: string = to
let amount: string = "1"
let transferHistory: Array<string> = []
describe("Describe DuckOwner entity assertions", () => {
  beforeAll(() => {
    let ownerEntity = new DuckOwner(id)
    ownerEntity.tokenId = BigInt.fromString(tokenId)
    ownerEntity.owner = Bytes.fromHexString(owner)
    ownerEntity.amount = BigInt.fromString(amount)
    ownerEntity.save()
  })

  afterAll(() => { clearStore() })

  test("DuckOwner created and stored", () => {
    assert.entityCount("DuckOwner", 1)
    assert.fieldEquals("DuckOwner", id, "tokenId", tokenId)
    assert.fieldEquals("DuckOwner", id, "amount", amount)
    assert.fieldEquals("DuckOwner", id, "owner", owner)
  })
})

let sender = "0xcad324acd43a981e801f02e56882a6db47c1eea8"
let receiver = "0xbe29e65a2865958a6377da43ffc0eee9395e06c5"
tokenId = "121314"

describe("handleDuckNFTTransfer()", () => {
  beforeAll(() => {
    const transferEvent = createDuckNFTTransferEvent(
      Address.fromString(sender),
      Address.fromString(receiver),
      BigInt.fromString(tokenId) 
    )
    handleDuckNFTTransfer(transferEvent)
  })

  afterAll(() => { clearStore() })

  test("handler should save DuckTransfer Event", () => {
    let id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-NFTTransfer-1"
    assert.entityCount("DuckNFTTransfer", 1)
    assert.fieldEquals("DuckNFTTransfer", id, "from", sender)
    assert.fieldEquals("DuckNFTTransfer", id, "to", receiver)
    assert.fieldEquals("DuckNFTTransfer", id, "tokenId", tokenId)
  })

  test("handler should save DuckOwner entity", () => {
    let id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-" + tokenId
    assert.entityCount("DuckOwner", 1)
    assert.fieldEquals("DuckOwner", id, "tokenId", tokenId)
    assert.fieldEquals("DuckOwner", id, "amount", "1")
    assert.fieldEquals("DuckOwner", id, "owner", receiver)
  })

  describe("HighstreetProperty", () => {
    test("should at least have two entities", () => {
      assert.entityCount("HighstreetProperty", 2)
    })
    test("handler should initialize new HighstreetProperty for sender if not exist", () => {
      assert.fieldEquals("HighstreetProperty", sender, "user", sender)
    })
    test("handler should initialize new HighstreetProperty for receiver if not exist", () => {
      assert.fieldEquals("HighstreetProperty", receiver, "user", receiver)
    })
    test("handler should update duck balance for receiver", () => {
      assert.fieldEquals("HighstreetProperty", receiver, "duck", "[" + tokenId + "]")
    })
    describe("receiver send token back to sender", () => {
      beforeAll(() => {
        const transferEvent = createDuckNFTTransferEvent(
          Address.fromString(receiver),
          Address.fromString(sender),
          BigInt.fromString(tokenId)
        )
        handleDuckNFTTransfer(transferEvent)
      })
      test("handler should update duck balance after transfer back", () => {
        assert.fieldEquals("HighstreetProperty", sender, "duck", "[" + tokenId + "]")
        assert.fieldEquals("HighstreetProperty", receiver, "duck", "[]")
      })
    })
  })

})
