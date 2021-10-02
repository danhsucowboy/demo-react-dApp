import { createReducer, nanoid } from '@reduxjs/toolkit'
import { updateBlockNumber } from './actions'

const initialState = {
    blockNumber: {},
    chainId: null,
}

export default createReducer(initialState, (builder) =>
  builder
    // .addCase(updateChainId, (state, action) => {
    //   const { chainId } = action.payload
    //   state.chainId = chainId
    // })
    .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
)