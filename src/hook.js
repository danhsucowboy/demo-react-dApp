import { useMemo, useState } from 'react'
import { useActiveWeb3React } from './hooks/web3'
import { isAddress } from './utils'
import { formatEther } from '@ethersproject/units'
import { getDefaultProvider } from '@ethersproject/providers'

export function useETHBalances(uncheckedAddresses, pending, setBalance) {
  const { library, chainId } = useActiveWeb3React()

  const addresses = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a) => a !== false)
            .sort()
        : [],
    [uncheckedAddresses]
  )

  const getBalance = async ({library, addresses, chainId}) => {
    if (library && addresses[0]) {
      const provider = getDefaultProvider(chainId)
      provider.getBalance(addresses[0]).then((balance) => {
        // console.log('check01')
        const balanceInEth = formatEther(balance)
        setBalance(balanceInEth)
      })
      .catch((err) => { console.log(err) })
    }
  }

  return useMemo(
    () => {
      getBalance({library, addresses, chainId})
    },
    [library, chainId, pending]
  )
}