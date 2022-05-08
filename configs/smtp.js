const path = require('path');
const nodemailer = require('nodemailer');
const mailerhbs = require('nodemailer-express-handlebars');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

const handlebarOptions = {
    viewEngine: {
        extName: ".hbs",
        partialsDir: path.resolve('./mail_templates'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./mail_templates'),
    extName: ".hbs",
};

transporter.use('compile', mailerhbs(handlebarOptions));

async function sendMail(mailTo, mailSubject, template, context){
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: mailTo,
        subject: mailSubject,
        template: template,
        context: context
    });
}

module.exports = { sendMail };