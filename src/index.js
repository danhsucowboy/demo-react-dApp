import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import store from './state';
import { Provider } from 'react-redux'
import ApplicationUpdater from './state/application/updater'
import TransactionUpdater from './state/transactions/updater'

const Web3ProviderNetwork = createWeb3ReactRoot('NETWORK')

function getLibrary(provider) {
  const library = new Web3Provider(provider)
  // library.pollingInterval = 5000
  return library
}

function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
    </>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <Updaters/>
          <App />
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
