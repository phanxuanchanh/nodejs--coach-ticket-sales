const Account = require('../models/account');
const { mongooseToObject, multipleMongooseToObject } = require('../utilities/mongoose-utility');
const randomUtility = require('../utilities/random_utility');
const md5 = require('md5');
const bcrypt = require('bcrypt');
const QueryResult = require('./query-status');
const saltRounds = 10;

class AccountDAO {

    getCustomers() {
        return new Promise((resolve, reject) => {
            Account.find({ accountType: 'Customer' }, function (error, account) {
                if (error)
                    reject(error);

                resolve(multipleMongooseToObject(account));
            });
        });
    }

    getEmployees() {
        return new Promise((resolve, reject) => {
            Account.find({
                $or: [
                    { accountType: 'Conductor' }, { accountType: 'Employer' }, { accountType: 'CoachDriver' },
                    { accountType: 'AssistantDriver' }]
            }, function (error, accounts) {
                if (error)
                    reject(error);

                resolve(multipleMongooseToObject(accounts));
            });
        });
    }


    searchCustomers(keyword) {
        return new Promise((resolve, reject) => {
            Account.find({
                $and: [{ accountType: 'Customer' }, {
                    $or: [
                        { fullname: { $regex: keyword, $options: "i" } }, { email: { $regex: keyword, $options: "i" } },
                        { phone: { $regex: keyword, $options: "i" } }]
                }]
            }, function (error, accounts) {
                if (error)
                    reject(error);

                resolve(multipleMongooseToObject(accounts));
            });
        });
    }

    searchEmployees(keyword) {
        return new Promise((resolve, reject) => {
            Account.find({
                $and: [
                    { $or: [{ accountType: 'Conductor' }, { accountType: 'Employer' }, { accountType: 'CoachDriver' }, { accountType: 'AssistantDriver' }] },
                    { $or: [{ fullname: { $regex: keyword, $options: "i" } }, { email: { $regex: keyword, $options: "i" } }, { phone: { $regex: keyword, $options: "i" } }] }]
            },
                function (error, accounts) {
                    if (error)
                        reject(error);

                    resolve(multipleMongooseToObject(accounts));
                });
        });
    }

    getCustomer(accountId) {
        return new Promise((resolve, reject) => {
            Account.findOne({ $and: [{ accountId: accountId }, { accountType: 'Customer' }] }, function (error, account) {
                if (error)
                    reject(error);
                else if (account)
                    resolve(new QueryResult('Success', mongooseToObject(account)));
                else
                    resolve(new QueryResult('NotFound', null));
            });
        });
    }

    getEmployee(accountId) {
        return new Promise((resolve, reject) => {
            Account.findOne({
                $and: [{ accountId: accountId }, {
                    $or: [{ accountType: 'Conductor' }, { accountType: 'Employer' }, { accountType: 'CoachDriver' }, { accountType: 'AssistantDriver' }]
                }]
            }, function (error, account) {
                if (error)
                    reject(error);
                else if (account)
                    resolve(new QueryResult('Success', mongooseToObject(account)));
                else
                    resolve(new QueryResult('NotFound', null));
            });
        });
    }

    getCustomerByPhone(phone) {
        return new Promise((resolve, reject) => {
            Account.findOne({ $and: [{ phone: phone }, { accountType: 'Customer' }] }, function (error, account) {
                if (error)
                    reject(error);
                else if (account)
                    resolve(new QueryResult('Success', mongooseToObject(account)));
                else
                    resolve(new QueryResult('NotFound', null));
            });
        });
    }

    getEmployeeByPhone(phone) {
        return new Promise((resolve, reject) => {
            Account.findOne({
                $and: [{ phone: phone },
                { $or: [{ accountType: 'Conductor' }, { accountType: 'Employer' }, { accountType: 'CoachDriver' }, { accountType: 'AssistantDriver' }] }]
            }, function (error, account) {
                if (error)
                    reject(error);
                else if (account)
                    resolve(new QueryResult('Success', mongooseToObject(account)));
                else
                    resolve(new QueryResult('NotFound', null));
            });
        });
    }

    getEmployeeByUsername(username) {
        return new Promise((resolve, reject) => {
            Account.findOne({
                $and: [{ username: username },
                { $or: [{ accountType: 'Conductor' }, { accountType: 'Employer' }, { accountType: 'CoachDriver' }, { accountType: 'AssistantDriver' }] }]
            }, function (error, account) {
                if (error)
                    reject(error);
                else if (account)
                    resolve(new QueryResult('Success', mongooseToObject(account)));
                else
                    resolve(new QueryResult('NotFound', null));
            });
        });
    }

    getAllTickets() {
        return new Promise((resolve, reject) => {
            Account.aggregate([{ $unwind: '$Tickets' }, {
                $project: {
                    _id: 0, fullname: 1, email: 1, phone: 1, CoachTrip: '$Tickets.CoachTrip', TicketDetail: '$Tickets.TicketDetail',
                    Payment: '$Tickets.Payment', coachTicketId: '$Tickets.coachTicketId', createdAt: '$Tickets.createdAt',
                    updatedAt: '$Tickets.updatedAt'
                }
            }], function (error, tickets) {
                if (error)
                    reject(error);

                for (let ticket of tickets) {
                    ticket.Customer = { customerName: ticket.fullname, email: ticket.email, phone: ticket.phone };
                    delete ticket.fullname;
                    delete ticket.email;
                    delete ticket.phone;
                }
                resolve(tickets);
            });
        });
    }

    getTicketByTicketId(ticketId) {
        return new Promise((resolve, reject) => {
            Account.aggregate([{ $unwind: '$Tickets' }, {
                $project: {
                    _id: 0, fullname: 1, email: 1, phone: 1, CoachTrip: '$Tickets.CoachTrip', TicketDetail: '$Tickets.TicketDetail',
                    Payment: '$Tickets.Payment', coachTicketId: '$Tickets.coachTicketId', createdAt: '$Tickets.createdAt',
                    updatedAt: '$Tickets.updatedAt'
                }
            }, { $match: { coachTicketId: ticketId } }], function (error, tickets) {
                if (error) {
                    reject(error);
                } else if (tickets.length > 0) {
                    let ticket = tickets[0];
                    ticket.Customer = { customerName: ticket.fullname, email: ticket.email, phone: ticket.phone };
                    delete ticket.fullname;
                    delete ticket.email;
                    delete ticket.phone;

                    resolve(new QueryResult('Success', ticket));
                } else {
                    resolve(new QueryResult('NotFound', null));
                }
            });
        });
    }

    deleteTicket(ticketId){
        return new Promise((resolve, reject) => { 
            Account.count({ 'Tickets.coachTicketId': ticketId }, function(error, count){
                if (error)
                    reject(error);
                
                if(count === 0){
                    resolve(new QueryResult('NotFound', null));
                }else{
                    Account.updateMany({ }, { $pull: { Tickets: { coachTicketId: ticketId } } }, 
                        { multi: true }, function(error2, result){
                        if (error2)
                            reject(error2);
        
                        Account.count({ "Tickets.coachTicketId": ticketId }, function(error3, count2){
                            if (error3)
                                reject(error3);
                            
                            if(count2 === 0)
                                resolve(new QueryResult('Success', null));
                            else
                                resolve(new QueryResult('Failed', null));
                        });
                    });
                }
            });
        });
    }

    deleteTicketFromCustomer(accountId, ticketId){
        return new Promise((resolve, reject) => {
            Account.updateOne({ accountId: accountId }, 
                { $pull: { Tickets: { coachTicketId: ticketId } } }, { multi: true }, function(error, result){
                if (error)
                    reject(error);
                console.log(result);
                if(result.matchedCount == 0)
                    resolve(new QueryResult('NotFound', null));
                else{
                    if(result.modifiedCount == 0)
                        resolve(new QueryResult('Failed', null));
                    else
                        resolve(new QueryResult('Success', null));
                }
            });
        });
    }

    addTicketToCustomer(item) {
        return new Promise((resolve, reject) => {

            let newTicket = {
                CoachTrip: {
                    coachTripId: item.coachTripId,
                    coachTripName: item.coachTripName,
                    departureTime: item.departureTime,
                    destinationTime: item.destinationTime,
                    licensePlate: item.licensePlate
                },
                Employee: {
                    employeeId: item.employeeId,
                    employeeName: item.employeeName
                },
                TicketDetail: {
                    seatPosition: item.seatPostion,
                    price: item.price,
                    subCharge: item.subCharge,
                    note: item.note,
                    totalMoney: item.totalMoney
                },
                Payment: {
                    paymentMethod: item.paymentMethod,
                    status: item.paymentStatus,
                    transactionContent: item.transactionContent,
                },
                coachTicketId: md5(`${item.customerName}&${item.coachTripName}///${randomUtility.getRandomString(24)}`),
                createdAt: new Date()
            };

            if(item.paymentStatus === 'Success')
                newTicket.Payment.purchaseDate = new Date();

            Account.updateOne({ accountId: item.customerId }, 
                { $push: { Tickets: newTicket } }, { multi: true }, function(error, result){
                if (error)
                    reject(error);

                Account.count({ $and: [{ accountId:  item.customerId }, { "Tickets.coachTicketId": newTicket.coachTicketId }] }, 
                function(error2, count){
                    if(error2)
                        reject(error2);
                    
                    if(count === 0)
                        resolve(new QueryResult('Failed', null));
                    else
                        resolve(new QueryResult('Success', null));
                });
            });
        });
    }

    createAccount(item) {
        return new Promise((resolve, reject) => {
            Account.findOne({ $and: [{ phone: item.phone }, { email: item.email }, { accountType: 'Customer' }] }, function (error, account) {
                if (error) {
                    reject(error);
                } else if (account) {
                    resolve(new QueryResult('AlreadyExists', null));
                } else {
                    if (!item.username)
                        item.username = `account_${new Date().getTime()}`;

                    let newAccount = new Account(item);
                    newAccount.accountId = md5(`${newAccount.email}&${newAccount.phone}///${randomUtility.getRandomString(24)}`);
                    newAccount.password = bcrypt.hashSync(newAccount.password, saltRounds);
                    newAccount.isActivated = false;

                    newAccount.save(function (error2, result) {
                        if (error2) {
                            reject(error2);
                        } else {
                            if (result)
                                resolve(new QueryResult('Success', mongooseToObject(result)));
                            else
                                resolve(new QueryResult('Failed', null));
                        }
                    });
                }
            });
        });
    }

    updateAccountStatus(accountId, isActivated) {
        return new Promise((resolve, reject) => {
            Account.findOne({ accountId: accountId }, function (error, account) {
                if (error) {
                    reject(error);
                } else if (account) {
                    account.isActivated = isActivated;
                    account.save(function (error2, result) {
                        if (error2) {
                            reject(error2);
                        } else {
                            if (result)
                                resolve(new QueryResult('Success', mongooseToObject(result)));
                            else
                                resolve(new QueryResult('Failed', null));
                        }
                    });
                } else {
                    resolve(new QueryResult('NotFound', null));
                }
            });
        });
    }

    updateAccount(item) {
        return new Promise((resolve, reject) => {
            Account.findOne({ accountId: item.accountId }, function (error, account) {
                if (error) {
                    reject(error);
                } else if (account) {

                    account.username = item.username;
                    account.fullname = item.fullname;
                    account.phone = item.phone;
                    account.email = item.email;
                    account.birthday = item.birthday;
                    account.gender = item.gender;
                    account.accountType = item.accountType;

                    account.save(function (error2, result) {
                        if (error2) {
                            reject(error2);
                        } else {
                            if (result)
                                resolve(new QueryResult('Success', mongooseToObject(result)));
                            else
                                resolve(new QueryResult('Failed', null));
                        }
                    });
                } else {
                    resolve(new QueryResult('NotFound', null));
                }
            });
        });
    }

    deleteAccount(accountId) {
        return new Promise((resolve, reject) => {
            Account.findOne({ accountId: accountId }, function (error, account) {
                if (error) {
                    reject(error);
                } else if (account) {
                    account.remove(function (error2, result) {
                        if (error2) {
                            reject(error2);
                        } else {
                            if (result)
                                resolve(new QueryResult('Success', null));
                            else
                                resolve(new QueryResult('Failed', null));
                        }
                    });
                } else {
                    resolve(new QueryResult('NotFound', null));
                }
            });
        });
    }

    countCustomer() {
        return new Promise((resolve, reject) => {
            Account.countDocuments({ accountType: 'Customer' }, function (error, count) {
                if (error) {
                    reject(error);
                }

                resolve(count);
            });
        });
    }

    countEmployee() {
        return new Promise((resolve, reject) => {
            Account.countDocuments({ $or: [{ accountType: 'Conductor' }, { accountType: 'Employer' }, { accountType: 'CoachDriver' }, { accountType: 'AssistantDriver' }] }, function (error, count) {
                if (error) {
                    reject(error);
                }

                resolve(count);
            });
        });
    }

    countTicket(){
        return new Promise((resolve, reject) => {
            Account.aggregate([{ $unwind: '$Tickets' }, { $group: { _id: null, count: { $sum: 1 } } } ], function(error, raw){
                if (error) {
                    reject(error);
                }
                
                if(raw.length == 0)
                    resolve(0);
                else
                    resolve(raw[0].count);
            });
        });
    }
}

module.exports = new AccountDAO();