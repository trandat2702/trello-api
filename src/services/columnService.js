
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    //Gọi tới tầng Model để xử lý lưu bản ghi newColumn vào trong Database
    const createdColumn = await columnModel.createNew(newColumn)
    // truy xuất lại bản ghi đầy đủ để trả về cho client
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
    if (getNewColumn) {
      //Xủ lý cấu trúc data ở đây trước khi trả dữ liệu về
      getNewColumn.cards = []

      //Cập nhật lại mảng ColumnOrderIds trong bảng Board
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) { throw error }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
  } catch (error) { throw error }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(404, 'Column not found')
    }
    //Xoá Column
    await columnModel.deleteOneById(columnId)
    //Xoá toàn bộ Cards thuộc Column này
    await cardModel.deleteManyByColumnId(columnId)
    //Xoá columnId khỏi mảng columnOrderIds trong bảng Board
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and its cards deleted successfully' }
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}