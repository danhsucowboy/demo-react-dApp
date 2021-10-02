import { useActiveWeb3React } from '../../hooks/web3'
import { useAppSelector } from '../hooks'

export function useBlockNumber() {
    const { chainId } = useActiveWeb3React()

    return useAppSelector((state) => state.application.blockNumber[chainId ?? -1])
}