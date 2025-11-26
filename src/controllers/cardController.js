import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { cardService } from '~/services/cardService'
const createNew = async (req, res, next) => {
  try {
    const createdcard = await cardService.createNew(req.body)
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.CREATED).json(createdcard)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const updatedCard = await cardService.update(cardId, req.body)
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}
export const cardController = {
  createNew,
  update
}