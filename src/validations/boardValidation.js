import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      //https://stackoverflow.com/questions/48720942/node-js-joi-how-to-display-a-custom-error-messages/68092831#68092831 tài liệu tham khảo khi custom message cho Joi
      //https://github.com/hapijs/joi/blob/master/lib/types/string.js#L694
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title must be at least {#limit} characters',
      'string.max': 'Title must be less than or equal to {#limit} characters',
      'string.trim': 'Title must not have leading or trailing spaces'
    }),
    description: Joi.string().required().min(3).max(255).trim().strict(),
    type: Joi.string().valid(...Object.values(BOARD_TYPES)).required()
  })
  try {
    // chỉ định abortEarly: false để hiển thị tất cả lỗi xảy ra validation
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    //Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }

}
const update = async (req, res, next) => {
  //Lưu ý không bắt buộc các trường khi update
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(255).trim().strict(),
    type: Joi.string().valid(...Object.values(BOARD_TYPES))
  })
  try {
    // chỉ định abortEarly: false để hiển thị tất cả lỗi xảy ra validation
    //Đối với trường hợp update , cho phép Unknown (không có trong schema) để tránh lỗi khi gửi lên các trường không cần thiết
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    //Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }

}
const moveCardBetweenColumns = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
    nextCardOrderIds: Joi.array().required().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
  })
  try {
    // chỉ định abortEarly: false để hiển thị tất cả lỗi xảy ra validation
    //Đối với trường hợp update , cho phép Unknown (không có trong schema) để tránh lỗi khi gửi lên các trường không cần thiết
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    //Validate dữ liệu xong xuôi hợp lệ thì cho request đi tiếp sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }

}
export const boardValidation = {
  createNew,
  update,
  moveCardBetweenColumns
}