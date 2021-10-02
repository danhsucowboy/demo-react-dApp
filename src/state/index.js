import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
// import { load, save } from 'redux-localstorage-simple'
import { createAction } from '@reduxjs/toolkit'
import application from './application/reducer'
import transactions from './transactions/reducer'

const store = configureStore({
    reducer: {
        // user,
        application,
        transactions,
    }
})

store.dispatch(createAction('global/updateVersion'))

setupListeners(store.dispatch)

export default store