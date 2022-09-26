import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { HighstreetProperty } from "../generated/schema";

export function initializeHsProperty(id: Address): HighstreetProperty {
  let newUser = new HighstreetProperty(id.toHex())
  newUser.user = id
  newUser.highEth = BigDecimal.zero()
  newUser.duck = []
  newUser.assets = []
  return newUser
}

// plusOrMinus => true for plus, false for minus
export function udpateHighBalance(
  property: HighstreetProperty,
  value: BigDecimal,
  type: string
): HighstreetProperty {
  if (type == "plus") {
    property.highEth = property.highEth.plus(value)
  }
  if (type == "minus") {
    property.highEth = property.highEth.minus(value)
  }
  return property
}

export function updateDuckInProperty(
  property: HighstreetProperty,
  ids: BigInt[],
  addOrRemove: bool
): HighstreetProperty {
  //property.duck 
  let newArray: Array<BigInt> = [];
  if (addOrRemove == true) {
    for(let i = 0; i < ids.length; i++) {
      newArray.push(ids[i])
    }
    if (property.duck !== null) {
      newArray.concat(property.duck!)
    }
  } else {
    for(let i = 0; i < property.duck!.length; i++) {
      if (ids.includes(property.duck![i]) == false) {
        newArray.push(property.duck![i])
      }
    }
  }
  property.duck = newArray
  return property
}

// addOrRemove => true for add, false for remove
export function updateAssetInProperty(
  property: HighstreetProperty,
  ids: BigInt[],
  addOrRemove: bool
): HighstreetProperty {
  if (addOrRemove == true) {
    for(let i = 0; i < ids.length; i++) {
      property.assets!.push(ids[i])
    }
  } else {
    let newArray: Array<BigInt> = [];
    for(let i = 0; i < property.assets!.length; i++) {
      if (ids.includes(property.assets![i]) == false) {
        newArray.push(property.assets![i])
      }
    }
    property.assets = newArray
  }
  return property
}
