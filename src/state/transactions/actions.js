import { createAction } from '@reduxjs/toolkit'

export const addTransaction = createAction('transactions/addTransaction')
export const finalizeTransaction = createAction('transactions/finalizeTransaction')
export const checkedTransaction = createAction('transactions/checkedTransaction')