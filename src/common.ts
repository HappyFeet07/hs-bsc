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
    for(let i = 0; i < property.duck!.length; i++) {
      newArray.push(property.duck![i])
    }
    property.duck = newArray
  } else {
    for(let i = 0; i < property.duck!.length; i++) {
      if (ids.includes(property.duck![i]) == false) {
        newArray.push(property.duck![i])
      }
    }
    property.duck = newArray
  }
  return property
}

// addOrRemove => true for add, false for remove
export function updateAssetInProperty(
  property: HighstreetProperty,
  ids: BigInt[],
  addOrRemove: bool
): HighstreetProperty {
  //property.duck 
  let idArray: Array<BigInt> = [];
  if (addOrRemove == true) {
    for(let i = 0; i < ids.length; i++) {
      idArray.push(ids[i])
    }
    for(let i = 0; i < property.assets!.length; i++) {
      idArray.push(property.assets![i])
    }
    property.assets = idArray
  } else {
    for(let i = 0; i < property.assets!.length; i++) {
      if (ids.includes(property.assets![i]) == false) {
        idArray.push(property.assets![i])
      }
    }
    property.assets = idArray
  }
  return property
}
