// import ApiError from "~/utils/ApiError"
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    //Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    //Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(newBoard)
    //lấy bản ghi board sau khi gọi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    //Trả về kết quả ,trong Service trả về gì thì Controller nhận được cái đó ,nếu k sẽ bị lỗi
    return getNewBoard
  } catch (error) { throw error }
}
const getDetails = async (boardId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }
    //B1: Deep Clone board ra một cái mới để xử lý ,không ảnh hưởng tới board ban đầu tùy mục đích về sau mà có cần clone deep hay không
    const resBoard = cloneDeep(board)
    //B2: Đưa card về đúng column của nó
    resBoard.columns.forEach(column => {
      //cách dùng .equals này  là bởi vì chúng ta hiểu ObjectId trong mongoDB có support method equals để so sánh 2 ObjectId với nhau
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))
    })
    //B3: xóa mảng cards khỏi board ban đầu vì đã phân bổ về đúng column
    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}
const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) { throw error }
}
//Khi di chuyển card giữa 2 column khác nhau
const moveCardBetweenColumns = async (reqBody) => {
  try {
    //B1:Cập nhập mảng cardOrderIds của column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    //B2:Cập nhập mảng của cardOrderIds của column đích (Hiểu bản chất là thêm cái _id của card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    //B3:Cập nhật lại mảng cards của cả 2 column (mảng này dùng để hiển thị danh sách card trong column)
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: Date.now()
    })
    return { updateResult: 'Success' }
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardBetweenColumns
}