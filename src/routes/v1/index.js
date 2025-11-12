import express from 'express'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { userRoute } from './userRoute'
const Router = express.Router()

//board APIs
Router.use('/boards', boardRoute)
//board APIs
Router.use('/columns', columnRoute)
//board APIs
Router.use('/cards', cardRoute)
//user APIs
Router.use('/users', userRoute)
export const APIs_V1 = Router
