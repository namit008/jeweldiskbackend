const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: config.smtp_email, // generated ethereal user
        pass: config.smtp_password, // generated ethereal password
    },
});

module.exports = { 
    send: function(email, subject, message) {
        // send mail with defined transport object
        transporter.sendMail({
            from: '"Jewel Disk" <' + config.smtp_email + '>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: message // plain text body
        });
    }
}