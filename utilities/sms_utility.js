const twilio = require('../configs/twilio');
const { getStringCurrentDateTime } = require('./current_datetime_utility');
const smsContentUtility = require('./sms_content_utility');

class SMSUtility {
    sendInvoiceSMSContent(userInfo) {
        let timestamp = getStringCurrentDateTime();
        twilio.sendSMS(userInfo.phone, smsContentUtility.getInvoiceSMSContent(1, timestamp));
    }
}

module.exports = new SMSUtility();