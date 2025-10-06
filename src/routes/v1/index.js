import express from 'express'
// import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
const Router = express.Router()

//board APIs
Router.use('/boards', boardRoute)


export const APIs_V1 = Router
