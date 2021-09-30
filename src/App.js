import { useWeb3React } from '@web3-react/core'
// import { useEagerConnect, useInactiveListener } from './hook';
import { injected, network } from './connector/connector'
import { useActiveWeb3React, useEagerConnect, useInactiveListener } from './hooks/web3';
import { useEffect } from 'react'

import './App.css';

const NetworkContextName = 'NETWORK'

function Web3ReactManager({ children }) {
  console.log('check 01')
  const { active } = useWeb3React()
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React(NetworkContextName)

  console.log(networkActive)
  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()
  console.log(triedEager)
  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError && !active) {
      activateNetwork(injected)
    }
  }, [triedEager, networkActive, networkError, activateNetwork, active])

  console.log('check 03')
  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  console.log('check 04')
  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (triedEager && !active && networkError) {
    return (
      <span>
        Oops! An unknown error occurred. Please refresh the page, or visit from another browser or device.
      </span>
    )
  }

  return children
}

function App() {

  // const testResult = useActiveWeb3React()
  const { active, account, library, connector, activate, deactivate } = useWeb3React()
  // const contextNetwork = useWeb3React<Web3Provider>('NETWORK')

  async function connect() {
    try {
      await activate(injected)
    } catch (ex) {
      console.log(ex)
    }
  }

  async function disconnect() {
    try {
      deactivate()
    } catch (ex) {
      console.log(ex)
    }
  }

  return (
    // <Web3ReactManager>
      <div className="main-div">
        <button onClick={connect} >Connect to MetaMask</button>
        {active ? <span>Connected with <b>{account}</b></span> : <span>Not connected</span>}
        <button onClick={disconnect} >Disconnect</button>
      </div>
    // </Web3ReactManager>
  );
}

export default App;
