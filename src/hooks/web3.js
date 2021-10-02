import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { injected } from '../connector/connector'

// const NetworkContextName = 'NETWORK'
// export const IS_IN_IFRAME = window.parent !== window

export function useActiveWeb3React() {
    const context = useWeb3React()
    const contextNetwork = useWeb3React<Web3Provider>('NETWORK')

    // console.log("Context: "+context)
    // console.log("ContextNetwork: "+contextNetwork)

    return context.active ? context : contextNetwork
}

export function useEagerConnect() {
    const { activate, active } = useWeb3React()
    const [tried, setTried] = useState(false)

    useEffect(() => {
        injected.isAuthorized().then((isAuthorized) => {
        if (isAuthorized) {
            activate(injected, undefined, true).catch(() => {
            setTried(true)
            })
        } else {
            setTried(true)
        }
        })
    }, []) // intentionally only running on mount (make sure it's only mounted once :))

    // if the connection worked, wait until we get confirmation of that to flip the flag
    useEffect(() => {
        if (!tried && active) {
        setTried(true)
        }
    }, [tried, active])

    return tried
}

export function useInactiveListener(suppress = false) {
    const { active, error, activate } = useWeb3React()

    useEffect(() => {
        const { ethereum } = window

        const paramTable = {
            'ethereum': !!ethereum,
            'ethereum.on' : !!ethereum.on,
            '!active': !active,
            '!error': !error,
            '!suppress': !suppress
        }
        console.table(paramTable)

        if (ethereum && ethereum.on && !active && !error && !suppress) {
            // const handleConnect = () => {
            //     console.log("Handling 'connect' event")
            //     activate(injected)
            // }
            const handleChainChanged = (chainId) => {
                console.log("Handling 'chainChanged' event with payload", chainId)
                activate(injected)
            }
            const handleAccountsChanged = (accounts) => {
                console.log("Handling 'accountsChanged' event with payload", accounts)
                if (accounts.length > 0) {
                activate(injected)
                }
            }
            // const handleNetworkChanged = (networkId) => {
            //     console.log("Handling 'networkChanged' event with payload", networkId)
            //     activate(injected)
            // }

            // ethereum.on('connect', handleConnect)
            ethereum.on('chainChanged', handleChainChanged)
            ethereum.on('accountsChanged', handleAccountsChanged)
            // ethereum.on('networkChanged', handleNetworkChanged)
            console.log('check ethereum on')
            return () => {
                if (ethereum.removeListener) {
                    console.log('check ethereum close')
                    // ethereum.removeListener('connect', handleConnect)
                    ethereum.removeListener('chainChanged', handleChainChanged)
                    ethereum.removeListener('accountsChanged', handleAccountsChanged)
                    // ethereum.removeListener('networkChanged', handleNetworkChanged)
                }
            }
        }
        return undefined
    }, [active, error, suppress, activate])
}