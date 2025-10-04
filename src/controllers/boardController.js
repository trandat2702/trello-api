import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
const createNew = async (req, res, next) => {
  try {
    // console.log('Body request: ', req.body)
    // console.log('Query request: ', req.query)
    // console.log('Params request: ', req.params)
    // res.status(StatusCodes.CREATED).json({ message: 'Board controller' })
    throw new ApiError(StatusCodes.BAD_REQUEST, 'This is new error from boardController.createNew')
  } catch (error) { next(error) }
}
export const boardController = {
  createNew
}