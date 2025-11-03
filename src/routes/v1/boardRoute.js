import express from 'express'
//import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
const Router = express.Router()

Router.route('/')
  .post(boardValidation.createNew, boardController.createNew)
Router.route('/:id')
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.update)

//API hỗ trợ di chuyển Card giữa các Column
Router.route('/supports/moving_card')
  .put(boardValidation.moveCardBetweenColumns, boardController.moveCardBetweenColumns)
export const boardRoute = Router