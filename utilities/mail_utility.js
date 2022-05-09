const smtp = require('../configs/smtp');
const { getStringCurrentDateTime } = require('./datetime_utility');

class MailUtility {
    sendLoginNotificationMail(userInfo) {
        if (process.env.SEND_LOGIN_NOTIFICATION === 'true') {
            smtp.sendMail(userInfo.email, 'Thông báo đăng nhập', 'login-notification', {
                timestamp: getStringCurrentDateTime()
            });
        }
    }

    sendConfirmationCode(userInfo, confirmationCode){
        if(process.env.SEND_CONFIRMATION_CODE === 'true'){
            smtp.sendMail(userInfo.email, 'Thông báo đăng nhập', 'confirmation-code', {
                confirmationCode: confirmationCode
            });
        }
    }

    sendInvoice(coachTicket){
        smtp.sendMail(coachTicket.Customer.email, 'Thông tin vé', 'invoice', {
            coachTicket: coachTicket
        });
    }
}

module.exports = new MailUtility();