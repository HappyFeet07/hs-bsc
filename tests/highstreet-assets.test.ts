import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, bigInt, Bytes, BigInt, Value } from "@graphprotocol/graph-ts"
import {
  AssetsTransferBatch,
  AssetsTransferSingle,
  AssetsOwner
} from "../generated/schema"
import {
  createTransferSingleEvent,
  createTransferBatchEvent
} from "./highstreet-assets-utils"
import {
  handleTransferSingle,
  handleTransferBatch
} from "../src/highstreet-assets"

let user: string = "0xb31e829f5345f8a767fb9dfd55e594f92f780591"
let id: string = "0x0000000000000000000000000000000000000001"
let from: string = "0x0000000000000000000000000000000000000123"
let to: string = "0x0000000000000000000000000000000000000234"
let tokenId: string = "1234"
let amount: string = "4321"
let ids: Array<string> = [ "111", "222", "333", "444" ]
let amounts: Array<string> = [ "1", "33", "555", "777" ]
let time: string = "1234567"

describe("Describe AssetsTransferSingle entity assertions", () => {
  beforeAll(() => {
    let transferSingleEntity = new AssetsTransferSingle(id)
    transferSingleEntity.from = Bytes.fromHexString(from)
    transferSingleEntity.to = Bytes.fromHexString(to)
    transferSingleEntity.tokenId = BigInt.fromString(tokenId)
    transferSingleEntity.amount = BigInt.fromString(amount)
    transferSingleEntity.timestamp = BigInt.fromString(time)
    transferSingleEntity.save()
  })

  afterAll(() => { clearStore() })

  test("AssetsTransferSingle Entity created and stored", () => {
    assert.entityCount("AssetsTransferSingle", 1)
    assert.fieldEquals("AssetsTransferSingle", id, "from", from)
    assert.fieldEquals("AssetsTransferSingle", id, "to", to)
    assert.fieldEquals("AssetsTransferSingle", id, "tokenId", tokenId)
    assert.fieldEquals("AssetsTransferSingle", id, "amount", amount)
    assert.fieldEquals("AssetsTransferSingle", id, "timestamp", time)
  })
})

describe("Describe AssetsTransferBatch entity assertions", () => {
  beforeAll(() => {
    let transferBatchEntity = new AssetsTransferBatch(id)
    transferBatchEntity.from = Bytes.fromHexString(from)
    transferBatchEntity.to = Bytes.fromHexString(to)
    transferBatchEntity.ids = ids.map<BigInt>((value: string): BigInt => BigInt.fromString(value))
    transferBatchEntity.amounts = amounts.map<BigInt>((value: string): BigInt => BigInt.fromString(value))
    transferBatchEntity.timestamp = BigInt.fromString(time)
    transferBatchEntity.save()
  })

  afterAll(() => { clearStore() })

  test("AssetsTransferBatch created and stored", () => {
    assert.entityCount("AssetsTransferBatch", 1)
    assert.fieldEquals("AssetsTransferBatch", id, "from", from)
    assert.fieldEquals("AssetsTransferBatch", id, "to", to)
    assert.fieldEquals("AssetsTransferBatch", id, "ids", "[" + ids.join(", ") + "]")
    assert.fieldEquals("AssetsTransferBatch", id, "amounts", "[" + amounts.join(", ") + "]")
    assert.fieldEquals("AssetsTransferBatch", id, "timestamp", time)
  })
})

describe("Describe AssetsOwner entity assertions", () => {
  beforeAll(() => {
    let ownerEntity = new AssetsOwner(id)
    ownerEntity.tokenId = BigInt.fromString(tokenId)
    ownerEntity.amount = BigInt.fromString(amount)
    ownerEntity.owner = Bytes.fromHexString(user)
    ownerEntity.save()
  })

  afterAll(() => { clearStore() })

  test("AssetsOwner created and stored", () => {
    assert.entityCount("AssetsOwner", 1)
    assert.fieldEquals("AssetsOwner", id, "tokenId", tokenId)
    assert.fieldEquals("AssetsOwner", id, "amount", amount)
    assert.fieldEquals("AssetsOwner", id, "owner", user)
  })
})

let sender = "0xcad324acd43a981e801f02e56882a6db47c1eea8"
let receiver = "0xbe29e65a2865958a6377da43ffc0eee9395e06c5"

describe("handleTransferSingle()", () => {
  beforeAll(() => {
    const transferEvent = createTransferSingleEvent(
      Address.fromString(sender),
      Address.fromString(sender),
      Address.fromString(receiver),
      BigInt.fromString(tokenId),
      BigInt.fromString(amount)
    )
    handleTransferSingle(transferEvent)
  })

  afterAll(() => { clearStore() })

  test("handler should save AssetsTransferSingle Event", () => {
    let id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-AssetsTransfer-1"
    assert.entityCount("AssetsTransferSingle", 1)
    assert.fieldEquals("AssetsTransferSingle", id, "from", sender)
    assert.fieldEquals("AssetsTransferSingle", id, "to", receiver)
    assert.fieldEquals("AssetsTransferSingle", id, "tokenId", tokenId)
    assert.fieldEquals("AssetsTransferSingle", id, "amount", amount)
  })

  describe("HighstreetProperty", () => {
    test("should at least have two entities", () => {
      assert.entityCount("HighstreetProperty", 2)
    })
    test("handler should initialize new HighstreetProperty for sender if not exist", () => {
      assert.fieldEquals("HighstreetProperty", sender, "user", sender)
    })
    test("handler should initialize new HighstreetProperty for receiver if not exist", () => {
      assert.fieldEquals("HighstreetProperty", sender, "user", sender)
    })
    test("handler should update assets balance for receiver", () => {
      assert.fieldEquals("HighstreetProperty", receiver, "assets", "[" + tokenId + "]")
    })
    describe("receiver send token back to sender", () => {
      beforeAll(() => {
        const transferEvent = createTransferSingleEvent(
          Address.fromString(receiver),
          Address.fromString(receiver),
          Address.fromString(sender),
          BigInt.fromString(tokenId),
          BigInt.fromString(amount)
        )
        handleTransferSingle(transferEvent)
      })
      test("handler should update assets balance after transfer back", () => {
        assert.fieldEquals("HighstreetProperty", sender, "assets", "[" + tokenId + "]")
        assert.fieldEquals("HighstreetProperty", receiver, "assets", "[]")
      })
      test("handler should add extra token after minted by zero address", () => {
        const transferEvent = createTransferSingleEvent(
          Address.zero(),
          Address.zero(),
          Address.fromString(sender),
          BigInt.fromString("7747"),
          BigInt.fromString(amount)
        )
        handleTransferSingle(transferEvent)
        assert.fieldEquals("HighstreetProperty", sender, "assets", "[" + "7747, " + tokenId + "]")
      })
      test("handler should remove token after sent", () => {
        const transferEvent = createTransferSingleEvent(
          Address.fromString(sender),
          Address.fromString(sender),
          Address.fromString(receiver),
          BigInt.fromString("7747"),
          BigInt.fromString(amount)
        )
        handleTransferSingle(transferEvent)
        assert.fieldEquals("HighstreetProperty", sender, "assets", "[" + tokenId + "]")
        assert.fieldEquals("HighstreetProperty", receiver, "assets", "[7747]")
      })
    })
  })
})

describe("handleTransferBatch()", () => {
  beforeAll(() => {
    const transferEvent = createTransferBatchEvent(
      Address.fromString(sender),
      Address.fromString(sender),
      Address.fromString(receiver),
      ids.map<BigInt>((value: string) => BigInt.fromString(value)),
      amounts.map<BigInt>((value: string) => BigInt.fromString(value))
    )
    handleTransferBatch(transferEvent)
  })

  afterAll(() => { clearStore() })
  
  test("handler should save AssetsTransferBatch Event", () => {
    let id = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-AssetsTransfer-1"
    assert.entityCount("AssetsTransferBatch", 1)
    assert.fieldEquals("AssetsTransferBatch", id, "from", sender)
    assert.fieldEquals("AssetsTransferBatch", id, "to", receiver)
    assert.fieldEquals("AssetsTransferBatch", id, "ids", "[" + ids.join(", ") + "]")
    assert.fieldEquals("AssetsTransferBatch", id, "amounts", "[" + amounts.join(", ") + "]")
  })
  
  describe("HighstreetProperty", () => {
    test("should at least have two entities", () => {
      assert.entityCount("HighstreetProperty", 2)
    })
    test("handler should initialize new HighstreetPropery for sender if not exist", () => {
      assert.fieldEquals("HighstreetProperty", sender, "user", sender)
    })
    test("handler should initialize new HighstreetProperty for receiver if not exist", () => {
      assert.fieldEquals("HighstreetProperty", sender, "user", sender)
    })
    test("handler should update assets balance for receiver", () => {
      assert.fieldEquals("HighstreetProperty", receiver, "assets", "[" + ids.join(", ") + "]")
    })
    test("handler should update assets balance for sender", () => {
      assert.fieldEquals("HighstreetProperty", sender, "assets", "[]")
    })
    describe("receiver send token back to sender", () => {
      beforeAll(() => {
        const transferEvent = createTransferBatchEvent(
          Address.fromString(receiver),
          Address.fromString(receiver),
          Address.fromString(sender),
          ids.map<BigInt>((value: string) => BigInt.fromString(value)),
          amounts.map<BigInt>((value: string) => BigInt.fromString(value)),
        )
        handleTransferBatch(transferEvent)
      })
      test("handler should update assets balance after transfer back", () => {
        assert.fieldEquals("HighstreetProperty", sender, "assets", "[" + ids.join(", ") + "]")
        assert.fieldEquals("HighstreetProperty", receiver, "assets", "[]")
      })
      test("handler should add extra token after minted by zero address", () => {
        const transferEvent = createTransferBatchEvent(
          Address.zero(),
          Address.zero(),
          Address.fromString(sender),
          [BigInt.fromString("7747")],
          [BigInt.fromString(amount)]
        )
        handleTransferBatch(transferEvent)
        assert.fieldEquals("HighstreetProperty", sender, "assets", "[" + "7747, " + ids.join(", ") + "]")
      })
      test("handler should remove token after sent", () => {
        const transferEvent = createTransferBatchEvent(
          Address.fromString(sender),
          Address.fromString(sender),
          Address.fromString(receiver),
          [BigInt.fromString("7747")],
          [BigInt.fromString(amount)]
        )
        handleTransferBatch(transferEvent)
        assert.fieldEquals("HighstreetProperty", sender, "assets", "[" + ids.join(", ") + "]")
        assert.fieldEquals("HighstreetProperty", receiver, "assets", "[7747]")
      })
    })
  })
})