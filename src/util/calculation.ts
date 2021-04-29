import Big from "big.js"
import { BigNumber } from "ethers"
import { bigNum2Big, big2BigNum } from "./dataTypes"

export function getLiquidationPrice(
    leverage: BigNumber,
    margin: BigNumber,
    openNotional: BigNumber,
    positionSize: BigNumber,
    mmr: BigNumber, // mmr: maintenanceMarginRatio
    k: BigNumber,
): BigNumber {
    const liquidationPrice = calcLiquidationPrice(
        bigNum2Big(leverage),
        bigNum2Big(margin),
        bigNum2Big(openNotional),
        bigNum2Big(positionSize),
        bigNum2Big(mmr),
        bigNum2Big(k),
    )
    return big2BigNum(liquidationPrice)
}

// copied from perp-web/src/util, but change the function name
// See details in
// https://www.notion.so/perp/New-liquidation-price-formula-exact-solution-6fc007bd28134f1397d13c8a6e6c1fbc
function calcLiquidationPrice(
    leverage: Big,
    margin: Big,
    openNotional: Big,
    positionSize: Big,
    mmr: Big, // mmr: maintenanceMarginRatio
    k: Big,
): Big {
    // NOTE: return zero for the case of no liquidation price
    // set 0.0001 as the deviation value
    if (leverage.lte(1.0001)) {
        return new Big(0)
    }

    const pn = positionSize.gte(0)
        ? margin.minus(openNotional).div(mmr.minus(1))
        : margin.add(openNotional).div(mmr.add(1))
    const x = positionSize.gte(0)
        ? positionSize
              .mul(-0.5)
              .add(positionSize.mul(pn).pow(2).add(pn.mul(k).mul(positionSize).mul(4)).sqrt().div(pn.mul(2)))
        : positionSize
              .mul(-0.5)
              .add(positionSize.mul(pn).pow(2).minus(pn.mul(k).mul(positionSize).mul(4)).sqrt().div(pn.mul(-2)))
    return k.div(x.pow(2))
}
