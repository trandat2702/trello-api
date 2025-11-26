import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'
const createNew = async (req, res, next) => {

  //console.log('req.body: ', req.body)
  //console.log('req.query: ', req.query)
  //console.log('req.params: ', req.params)
  //console.log('req.files: ', req.files)
  //console.log('req.cookies: ', req.cookies)
  //console.log('req.jwtDecoded: ', req.jwtDecoded)
  const userId = req.jwtDecoded._id

  try {
    const createdBoard = await boardService.createNew(userId, req.body)
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const board = await boardService.getDetails(userId, boardId)
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) { next(error) }
}

const moveCardBetweenColumns = async (req, res, next) => {
  try {
    const result = await boardService.moveCardBetweenColumns(req.body)
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id

    //page và itemsPerPage được truyền vào trong query url từ phía FE nên BE sẽ lấy thông qua req.query
    const { page, itemsPerPage } = req.query
    const results = await boardService.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))
    res.status(StatusCodes.OK).json(results)
  } catch (error) { next(error) }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardBetweenColumns,
  getBoards
}