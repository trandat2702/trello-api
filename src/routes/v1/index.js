import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'Welcome to API version 1' })
})
//board APIs
Router.use('/boards', boardRoute)


export const APIs_V1 = Router
