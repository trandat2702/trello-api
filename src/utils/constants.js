import { env } from '~/config/environment.js'
//Những domain được phép truy cập tới tài nguyên của Server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173'
  // //Không cần localhost vì ở file
  // config/cors.js chúng ta đã luôn luôn cho phép môi trường dev truy cập rồi
  'https://trello-web-pro-mu.vercel.app'
]
export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAMIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVLOPMENT