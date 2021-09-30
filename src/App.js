import { useWeb3React } from '@web3-react/core'
// import { useEagerConnect, useInactiveListener } from './hook';
import { t } from '@lingui/macro'
import { injected } from './connector/connector'
import { useActiveWeb3React, useEagerConnect, useInactiveListener } from './hooks/web3';
import { useEffect, useState } from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import ErrorMessage from './transaction/ErrorMessage';
import TxList from './transaction/TxList'

import './App.css';

const NetworkContextName = 'NETWORK'

function isZero(hexNumberString) {
  return /^0x0*$/.test(hexNumberString)
}

function swapErrorToUserReadableMessage(error) {
  let reason = ""
  while (Boolean(error)) {
    reason = error.reason ?? error.message ?? reason
    error = error.error ?? error.data?.originalError
  }

  if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substr('execution reverted: '.length)

  switch (reason) {
    case 'TransferHelper: TRANSFER_FROM_FAILED':
      return t`The input token cannot be transferred. There may be an issue with the input token.`
    case 'Too little received':
    case 'Too much requested':
    case 'STF':
      return t`This transaction will not succeed due to price movement. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`
    case 'TF':
      return t`The output token cannot be transferred. There may be an issue with the output token. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`
    default:
      if (reason?.indexOf('undefined is not an object') !== -1) {
        console.error(error, reason)
        return t`An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`
      }
      return t`Unknown error${
        reason ? `: "${reason}"` : ''
      }. Try increasing your slippage tolerance. Note: fee on transfer and rebase tokens are incompatible with Uniswap V3.`
  }
}

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

  const startPayment = async ({ setError, setTxs, ether, addr }) => {
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");
      console.log('check 01')
      await window.ethereum.send("eth_requestAccounts");


      console.log('check 02 ether: ' + ether)
      const value = parseUnits(ether, 18);
      console.log('Value Hex:' + value)
      // const { account, chainId, library } = useActiveWeb3React()
      // const provider = new Web3Provider(window.ethereum);
      const signer = library.getSigner();
      console.log('isZero: ' + isZero(value))

      // library.getAddress(addr);
      const tx = signer.sendTransaction({
        from: account,
        to: addr,
        gasLimit: BigNumber.from('21000').toHexString(),
        ...(value && !isZero(value) ? { value } : {}),
      })
      .then((response) => {
        console.log({ value, addr });
        return response.hash
      })
      .catch((error) => {
        // if the user rejected the tx, pass this along
        if (error?.code === 4001) {
          throw new Error('Transaction rejected.')
        } else {
          // otherwise, the error was unexpected and we need to convey that
          console.error(`Demo Trans Failed`, error, addr, value)

          throw new Error(`Demo Trans failed: ${swapErrorToUserReadableMessage(error)}`)
        }
      })
      console.log("tx", tx);
      setTxs([tx]);
      console.log('check 03')
    } catch (err) {
      setError(err.message);
    }
  };

  const [error, setError] = useState();
  const [txs, setTxs] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setError();
    await startPayment({
      setError,
      setTxs,
      ether: data.get("ether"),
      addr: data.get("addr")
    });
  };

  return (
    // <Web3ReactManager>
      <div className="main-div" >
        <button onClick={connect} >Connect to MetaMask</button>
        {active ? <span>Connected with <b>{account}</b></span> : <span>Not connected</span>}
        <button onClick={disconnect} >Disconnect</button>

      <form onSubmit={handleSubmit}>
        <div className="main-div">
          <main>
            <h1>
              Send ETH payment
            </h1>
            <div className="main-div">
              <div >
                <input
                  type="text"
                  name="addr"
                  placeholder="Recipient Address"
                />
              </div>
              <div>
                <input
                  name="ether"
                  type="text"
                  placeholder="Amount in ETH"
                />
              </div>
            </div>
          </main>
          <footer className="main-div">
            <button
              type="submit"
            >
              Pay now
            </button>
            <ErrorMessage message={error} />
            <TxList txs={txs} />
          </footer>
        </div>
      </form>


      </div>
    // </Web3ReactManager>
  );
}

export default App;
