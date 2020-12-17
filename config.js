module.exports = {
    mongoURI: 'mongodb+srv://jatud:wDNS4vtKB7Y675lZ@plzvisit-cuz0k.mongodb.net/db?retryWrites=true&w=majority',
    // mongoURI: 'mongodb://localhost:27017/db',
    smtp_email: 'smtpjeweldisk.com',
    smtp_password: 'Jsk@2021',
    dbOptions: {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },
    modelTag: {
        user: 'user',
        profile: 'profile',
        role: 'role',
        coupon: 'coupon',
        otp: 'otp',
        state: 'state',
        district: 'district',
        town: 'town'
    },
    smsGatewayApi: {
        url: 'http://sms.angelexpress.in/REST/sendsms/',
        username: 'krishna',
        senderid: "JWLDSk",
        clientSMSID: "1947692308",
        accountusagetypeid: "1",
        password: "ae97fb520cXX",
        user: "krishna"
    }
} 
