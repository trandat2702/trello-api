import { StatusCodes } from 'http-status-codes'
const createNew = async (req, res) => {
  try {
    // console.log('Body request: ', req.body)
    // console.log('Query request: ', req.query)
    // console.log('Params request: ', req.params)
    res.status(StatusCodes.CREATED).json({ message: 'Board controller' })
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: error.message
    })
  }
}
export const boardController = {
  createNew
}