import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { columnService } from '~/services/columnService'
const createNew = async (req, res, next) => {
  try {
    const createdColumn = await columnService.createNew(req.body)
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.CREATED).json(createdColumn)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const updatedColumn = await columnService.update(columnId, req.body)
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(updatedColumn)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const columnId = req.params.id
    const result = await columnService.deleteItem(columnId)
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.NO_CONTENT).json(result)
  } catch (error) { next(error) }
}
export const columnController = {
  createNew,
  update,
  deleteItem
}