const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

const coachtickets = new Schema({
    coachTicketId: { type:String },
    CoachTrip: {
        coachTripId: { type: String },
        coachTripName: { type: String },
        departureTime: { type: Date },
        destinationTime: { type: Date },
        licensePlate: { type: String }
    },
    Customer: {
        customerId: { type: String },
        customerName: { type: String },
        email: { type: String },
        phone: { type: String }
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
        purchaseDate: { type: Date },
    }
},{
    timestamps: true
});

// Add plugs
mongoose.plugin(slug);
coachtickets.plugin(mongooseDelete, {
    deletedAt : true,
    overrideMethods: 'all'
})

module.exports = mongoose.model('coachtickets', coachtickets);