import express from 'express'
// import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
const Router = express.Router()

//board APIs
Router.use('/boards', boardRoute)
//board APIs
Router.use('/columns', columnRoute)
//board APIs
Router.use('/cards', cardRoute)

export const APIs_V1 = Router
