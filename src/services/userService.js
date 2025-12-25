/* eslint-disable no-lonely-if */
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs/dist/bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAMIN } from '~/utils/constants.js'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { jwtProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { GoogleProvider } from '~/providers/GoogleProvider'
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
      password: await bcrypt.hashSync(reqBody.password, 8), //Mã hóa password trước khi lưu vào Database, tham số thứ 2 là độ phức tạp, giá trị càng cao thì băm càng lâu
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

const verifyAccount = async (repBody) => {
  try {
    //Tìm user trong hệ thống với email và token
    const existUser = await userModel.findOneByEmail(repBody.email)

    //Các bước kiểm tra cần thiết
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại trong hệ thống')
    }
    if (existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản đã được kích hoạt trước đó, vui lòng đăng nhập để sử dụng dịch vụ')
    }
    if (repBody.token !== existUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token xác thực không hợp lệ, vui lòng kiểm tra lại email xác thực của bạn')
    }

    // Nếu như mọi thứ ok thì chúng ta bắt đầu update lại thông tin của thằng user để verify tài khoản
    const updateData = {
      isActive: true,
      verifyToken: null //Xác thực xong thì ta xóa token đi
    }

    //Thực hiện update thông tin user trong database
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  }
  catch (error) { throw error }
}

const login = async (repBody) => {
  try {
    //Query user trong Database
    const existUser = await userModel.findOneByEmail(repBody.email)
    //Các bước kiểm tra cần thiết
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại trong hệ thống')
    }
    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản chưa được kích hoạt, vui lòng kiểm tra email để xác thực tài khoản')
    }
    if (bcrypt.compareSync(repBody.password, existUser.password) === false) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Mật khẩu không đúng, vui lòng thử lại')
    }
    //Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về phía FE
    //Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email cho user
    const userInfo = { _id: existUser._id, email: existUser.email }
    //Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await jwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 100
      env.REFRESH_TOKEN_LIFE
    )
    //Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  }
  catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Bước 01: Thực hiện giải mã refreshToken xem nó có hợp lệ hay là không
    const refreshTokenDecoded = await jwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới.
    const userInfo = { _id: refreshTokenDecoded._id, email: refreshTokenDecoded.email }

    // Bước 02: Tạo ra cái accessToken mới
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) { throw error }
}
const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query User và kiểm tra cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if (!existUser) { throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại trong hệ thống') }
    if (!existUser.isActive) { throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Tài khoản chưa được kích hoạt, vui lòng kiểm tra email để xác thực tài khoản') }
    // Khởi tạo kết quả updated User ban đầu là empty
    let updatedUser = {}

    //Trường hợp changed password
    if (reqBody.current_password && reqBody.new_password) {
      //Kiểm tra current_password có đúng không
      if (!bcrypt.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Mật khẩu hiện tại không đúng, vui lòng thử lại')
      }
      // Nếu như current_password đúng thì chúng ta sẽ hash một cái mật khẩu mới và update lại vào DB
      updatedUser = await userModel.update(userId, {
        password: await bcrypt.hashSync(reqBody.new_password, 8)
      })
    }
    else if (userAvatarFile) {
      //Trường hợp upload file lên Cloud Storage, cụ thể là Cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      // console.log('🚀 ~ update ~ uploadResult:', uploadResult)

      //Lưu lại url của cái file ảnh vào trong database
      updatedUser = await userModel.update(userId, {
        avatar: uploadResult.secure_url
      })
    }
    else {
      // Trường hợp chỉ update các thông tin chung, ví dụ như displayName
      updatedUser = await userModel.update(userId, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) { throw error }
}
const loginWithGoogle = async (googleToken) => {
  try {
    // 1.Verify token với Google
    const googleProfile = await GoogleProvider.verifyGoogleToken(googleToken)

    if (!googleProfile.isVerified) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Email chưa được Google xác thực')
    }

    // 2.Tìm user theo googleId hoặc email
    let existUser = await userModel.findOneByGoogleId(googleProfile.googleId)
    if (!existUser) {
      existUser = await userModel.findOneByEmail(googleProfile.email)
    }

    // 3. Nếu chưa có user, tạo mới
    if (!existUser) {
      const nameFromEmail = googleProfile.email.split('@')[0]
      const newUser = {
        email: googleProfile.email,
        username: nameFromEmail,
        displayName: googleProfile.displayName,
        avatar: googleProfile.avatar,
        googleId: googleProfile.googleId,
        authType: 'google',
        isActive: true, // Auto active vì Google đã verify
        verifyToken: null
      }
      const createdUser = await userModel.createNew(newUser)
      existUser = await userModel.findOneById(createdUser.insertedId)
    }

    else {
      // 4. Nếu user đã tồn tại nhưng chưa có googleId, update thêm
      if (!existUser.googleId) {
        await userModel.update(existUser._id, {
          googleId: googleProfile.googleId,
          authType: 'google',
          isActive: true,
          avatar: existUser.avatar || googleProfile.avatar
        })
        existUser.googleId = googleProfile.googleId
      }
    }

    // 5. Tạo JWT tokens
    const userInfo = { _id: existUser._id, email: existUser.email }
    const accessToken = await jwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await jwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )

    return { accessToken, refreshToken, ...pickUser(existUser) }
  }
  catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update,
  loginWithGoogle
}