import { OAuth2Client } from 'google-auth-library'
import { env } from '~/config/environment'

//tài liệu tham khảo: https://developers.google.com/identity/sign-in/web/backend-auth?hl=vi#node.js
// khởi tạo Google OAuth Client
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()

    return {
      googleId: payload.sub,
      email: payload.email,
      displayName: payload.name,
      avatar: payload.picture,
      isVerified: payload.email_verified
    }
  }
  catch (error) {
    throw new Error('Invalid Google token')
  }
}
export const GoogleProvider = {
  verifyGoogleToken
}