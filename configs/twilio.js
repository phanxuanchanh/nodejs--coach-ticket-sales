const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

async function sendSMS(smsTo, message){
  client.messages.create({
     body: message,
     from: process.env.TWILIO_PHONE_NUMBER,
     to: smsTo
   }).then(message => console.log(message.sid));
}

module.exports = { sendSMS };

