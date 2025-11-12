import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs/dist/bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAMIN } from '~/utils/constants.js'
import { BrevoProvider } from '~/providers/BrevoProvider'
const createNew = async (reqBody) => {
  try {
    //Kiểm tra xem email đã tồn tại trong hệ thống chúng ta hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email đã được sử dụng ,Vui lòng chọn email khác')
    }

    //Tạo data để lưu vào Database
    //namFromEmail: nếu email là quocdatdev@gmail.com thì sẽ lấy được "quocdatdev"
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: await bcrypt.hash(reqBody.password, 8), //Mã hóa password trước khi lưu vào Database, tham số thứ 2 là độ phức tạp, giá trị càng cao thì băm càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail, //Mặc định để giống username khi user đăng ký mới, về sau làm tính năm update cho user
      verifyToken: uuidv4() //Tạo token ngẫu nhiên để gửi cho user xác thực email
    }
    //Thực hiện lưu thông tin user vào Database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    //Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAMIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Xác thực tài khoản của bạn'
    const htmlContent = `
    <h3>Chào mừng bạn đến với dịch vụ của chúng tôi! Vui lòng nhấp vào liên kết bên dưới để xác thực tài khoản của bạn:</h3>
    <h3>${verificationLink}</h3>
    <h3>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</h3>
    `
    //Gọi tới cái Provider gửi mail
    await BrevoProvider.sendEmail(
      getNewUser.email,
      customSubject,
      htmlContent
    )

    //return trả dữ liệu về Controller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}
export const userService = {
  createNew
}