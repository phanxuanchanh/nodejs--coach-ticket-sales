const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

const customer = new Schema({
    customerId: { type: String },
    fullname: { type: String },
    phone: { type: String },
    email: { type: String },
    address: {type:String },
    birthday: { type: String },
    gender: { type: String },
    password: { type: String },
    isActivated: { type: Boolean },
    bankAccountName: { type: String },
    bankAccoutNumber:{ type: String },
    cardNumber: { type: String },
    cardExpirationDate: { type: Date },
    momoAccount:{ type: String }
},{
    timestamps: true
});
// AddN plugs
mongoose.plugin(slug);
customer.plugin(mongooseDelete, {
    deletedAt : true,
    overrideMethods: 'all'
})

module.exports = mongoose.model('customer', customer);