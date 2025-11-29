
const Constants = {
    
    emailCredentials: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        username: process.env.SMTP_USERNAME,
        password: process.env.SMTP_PASSWORD,
        name: process.env.SMTP_NAME,
        clientId: process.env.SMTP_CLIENT_ID,
        clientSecret: process.env.SMTP_CLIENT_SECRET,
        redirectUri: process.env.SMTP_REDIRECT_URI,
        refreshToken: process.env.SMTP_REFRESH_TOKEN,
        accessToken: process.env.SMTP_ACCESS_TOKEN
    },
}

module.exports = Constants;