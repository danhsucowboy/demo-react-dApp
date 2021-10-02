// import { TransactionResponse } from '@ethersproject/providers'
import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector} from '../hooks'

import { useActiveWeb3React } from '../../hooks/web3'
import { addTransaction } from './actions'
// import { TransactionDetails } from './reducer'

export function useTransactionAdder() {
    const { chainId, account } = useActiveWeb3React()
    const dispatch = useAppDispatch()
  
    return useCallback(
      (response, info) => {
        if (!account) return
        if (!chainId) return
  
        const { hash } = response
        if (!hash) {
          throw Error('No transaction hash found.')
        }
        dispatch(addTransaction({ hash, from: account, info, chainId }))
      },
      [dispatch, chainId, account]
    )
}

export function useAllTransactions() {
    const { chainId } = useActiveWeb3React()
  
    const state = useAppSelector((state) => state.transactions)
  
    return chainId ? state[chainId] ?? {} : {}
}

export function isTransactionRecent(tx) {
  return new Date().getTime() - tx.addedTime < 86_400_000
}