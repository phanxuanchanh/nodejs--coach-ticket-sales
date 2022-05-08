const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

const ticket = new Schema({
    coachTicketId: { type: String },
    CoachTrip: {
        coachTripId: { type: String },
        coachTripName: { type: String },
        departureTime: { type: Date },
        destinationTime: { type: Date },
        licensePlate: { type: String }
    },
    Employees: {
        employeeId: { type: String },
        employeeName: { type: String }
    },
    TicketDetail: {
        seatPosition: { type: String },
        price: { type: Number },
        subCharge: { type: Number },
        note: { type: String },
        totalMoney: { type: Number }
    },
    Payment: {
        paymentMethod: { type: String },
        status: { type: String },
        transactionContent: { type: String },
        purchaseDate: { type: Date }
    }
},{
    timestamps: true
});


const account = new Schema({
    accountId: { type: String },
    username: { type: String },
    fullname: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    birthday: { type: Date },
    gender: { type: String },
    accountType: { type: String, default: 'Customer' },
    password: { type: String },
    isActivated: { type: Boolean, default: false },
    bankAccountName: { type: String },
    bankAccoutNumber: { type: String },
    cardNumber: { type: String },
    cardExpirationDate: { type: Date },
    momoAccount: { type: String },
    Tickets: { type: [ ticket ] }
}, {
    timestamps: true
});
// AddN plugs
mongoose.plugin(slug);
account.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all'
})

module.exports = mongoose.model('account', account);