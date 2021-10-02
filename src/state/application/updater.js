import { useActiveWeb3React } from '../../hooks/web3'
import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { useDebounce } from '../../hooks/useDebounce'
import { updateBlockNumber } from './actions'

export default function Updater() {
    const { account, chainId, library } = useActiveWeb3React()
    const dispatch = useAppDispatch()

    const [state, setState] = useState({
        chainId,
        blockNumber: null,
    })

    const blockNumberCallback = useCallback(
        (blockNumber) => {
            setState((state) => {
            if (chainId === state.chainId) {
                if (typeof state.blockNumber !== 'number') return { chainId, blockNumber }
                return { chainId, blockNumber: Math.max(blockNumber, state.blockNumber) }
            }
            return state
            })
        },
        [chainId, setState]
    )

    useEffect(() => {
        if (!library || !chainId) return undefined

        setState({ chainId, blockNumber: null })

        library
            .getBlockNumber()
            .then(blockNumberCallback)
            .catch((error) => console.error(`Failed to get block number for chainId: ${chainId}`, error))

        library.on('block', blockNumberCallback)
        return () => {
            library.removeListener('block', blockNumberCallback)
        }
    }, [dispatch, chainId, library, blockNumberCallback])

    const debouncedState = useDebounce(state, 100)

    useEffect(() => {
        if (!debouncedState.chainId || !debouncedState.blockNumber) return
        dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
    }, [dispatch, debouncedState.blockNumber, debouncedState.chainId])
    
    // useEffect(() => {
    //     dispatch(
    //         updateChainId({ chainId: debouncedState.chainId ? supportedChainId(debouncedState.chainId) ?? null : null })
    //     )
    // }, [dispatch, debouncedState.chainId])

    return null
}