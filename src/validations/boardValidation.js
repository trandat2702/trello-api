import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'

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
export const boardValidation = {
  createNew
}