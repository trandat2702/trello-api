import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'

//Define Collection (Name & Schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(255).trim().strict(),
  type: Joi.string().valid(...Object.values(BOARD_TYPES)).required(),

  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Những Admin của cái board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  //Những thành viên của board
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Các trường không được phép cập nhật
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
    return createdBoard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) { throw new Error(error) }
}
//Query tổng hợp (aggregate) để lấy toàn bộ Columns và Cards bên trong Board luôn
const getDetails = async (userId, boardId) => {
  try {
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    //Tài liệu tham khảo https://www.mongodb.com/docs/manual/reference/method/db.collection.aggregate/
    const queryCondition = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: { $and: queryCondition }
      },
      {
        // tài liệu tham khảo https://www.mongodb.com/docs/v7.0/reference/operator/aggregation/lookup/
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw new Error(error) }
}

// Nhiệm vụ của func này là push 1 cái giá trị columnId vào trong mảng columnOrderIds của bảng Board
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

// Lấy một phần tử columnId ra khỏi mảng columnOrderIds
// Dùng $pull trong mongodb ở trường hợp này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}


const update = async (boardId, updateData) => {
  try {
    //Lọc ra những cái field không được phép cập nhật linh tinh
    Object.keys(updateData).forEach(key => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updateData[key]
      }
    })
    // Đối với những dữ liệu liên quan đến ObjectId thì cần convert chúng về dạng ObjectId
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(id => new ObjectId(id))
    }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData }, // chỉ ghi đè những field được phép
      { returnDocument: 'after' } // trả về kết quả mới sau khi cập nhập
    )
    return result
  } catch (error) { throw new Error(error) }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryCondition = [
      //Điều kiện 1: Board chưa bị xoá
      { _destroy: false },
      //Điều kiện 2: Cái thằng userId đang thực hiện request này nó phải thuộc vào một trong 2 cái mảng ownerIds hoặc memberIds, sử dụng toàn tử $all của mongodb
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } }
        ]
      }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryCondition } },
        //sort title của board theo A-Z(mặc định sẽ bị chữ B hoa đúng trước chữ a thường)
        { $sort: { title: 1 } },
        // $facet để xử lý nhiều luồng trong một query
        {
          $facet: {
            //Luồng thứ nhất: Query boards
            'queryBoards': [
              { $skip: pagingSkipValue(page, itemsPerPage) }, //Bỏ qua số lượng bản ghi của những page trước đó
              { $limit: itemsPerPage } //Giới hạn tối đa số lượng bản ghi trên 1 page
            ],
            //Luồng thứ hai: Query đếm tổng tất cả số lượng bản ghi boards trong DB và trả về countedAllBoards
            'queryTotalBoards': [
              { $count: 'countedAllBoards' }
            ]
          }
        }
      ],
      //Khai báo thêm thuộc tính collation locale 'en' để fix vụ chữ B hoa và a thưởng ở trên
      { collation: { locale: 'en' } }
    ).toArray()
    // console.log('Aggregate getBoards result:', query)

    const res = query[0]
    // console.log('🚀 ~ getBoards ~ res:', res)
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }

  } catch (error) { throw new Error(error) }
}
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards
}