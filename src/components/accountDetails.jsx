import { useEffect } from "react"
import { useActiveWeb3React } from "../hooks/web3"
import { useAllTransactions } from "../state/transactions/hooks"
import { parseEther } from "@ethersproject/units"
import { shortenAddress } from "../utils"
import styled from 'styled-components'

const Icons = styled.div`
    padding-left: 10px;
`

export default function Transaction({ hash }) {
    const { chainId } = useActiveWeb3React()
    const allTransactions = useAllTransactions()
  
    const tx = allTransactions?.[hash]
    const info = tx?.info
    const pending = !tx?.receipt
    const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')
  
    useEffect(() => {
        console.log("Pending: " + JSON.stringify(pending))
      },[pending])    

    if (!chainId) return null
  
    return (
      <>
        <div
        //   href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}
          pending={pending}
          success={success}
          className = "row-div"
        >
          <div>
              <span>{info?.type}: {info?.currencyAmount} ETH from "{shortenAddress(info?.from)}" to "{shortenAddress(info?.to)}" </span>
          </div>
          <Icons>
            {pending ? <span>{String.fromCodePoint('0x1F916')}pending...</span> : success ? <span>{String.fromCodePoint('0x1F44C')}</span> : <span>{String.fromCodePoint('0x1F631')}</span>}
          </Icons>
        </div>
      </>
    )
  }