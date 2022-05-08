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
            Account.find({ $or: [{ accountType: 'Conductor' }, { accountType: 'Employer' }, { accountType: 'CoachDriver' }, { accountType: 'AssistantDriver' }] }, function (error, accounts) {
                if (error)
                    reject(error);

                resolve(multipleMongooseToObject(accounts));
            });
        });
    }


    searchCustomers(keyword) {
        return new Promise((resolve, reject) => {
            Account.find({ $or: [{ fullname: { $regex: keyword, $options: "i" } }, { email: { $regex: keyword, $options: "i" } }, { phone: { $regex: keyword, $options: "i" } }] }, function (error, accounts) {
                if (error)
                    reject(error);

                resolve(multipleMongooseToObject(accounts));
            });
        });
    }

    searchEmployees(keyword) {
        return new Promise((resolve, reject) => {
            Account.find({ $or: [{ fullname: { $regex: keyword, $options: "i" } }, { email: { $regex: keyword, $options: "i" } }, { phone: { $regex: keyword, $options: "i" } }] }, function (error, accounts) {
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

    getTicketsOfCustomer(accountId) {
        return new Promise((resolve, reject) => {
            Account.aggregate({
                $project: {
                    _id: 0,
                    Tickets: 1
                }
            })

            Account.aggregate({ $group: { _id: "$Tickets" } }, function (error, tickets) {
                if (error)
                    reject(error);

                resolve(multipleMongooseToObject(tickets));
            })
        });
    }

    getTicketOfCustomer(accountId, coachTicketId) {
        return new Promise((resolve, reject) => {
            Account.aggregate([
                { $match: { "$accountId": accountId } },
                {
                    $project: {
                        _id: 0,
                        coachTicketId: "$Tickets.coachTicketId",
                        CoachTrip: "$Tickets.CoachTrip",
                        Employee: "$Tickets.Employee",
                        TicketDetail: "$Ticket.TicketDetail",
                        Payment: "$Ticket.Payment"
                    }
                }
            ]), function (error, ticket) {
                if (error)
                    reject(error);
                else if (ticket)
                    resolve(new QueryResult('Success', mongooseToObject(ticket)));
                else
                    resolve(new QueryResult('NotFound', null));
            }
        });
    }

    addTicketOfCustomer(accountId, item) {
        return new Promise((resolve, reject) => {
            Account.updateOne({ accountId: accountId }, { $push: { tickets: item } }, function (error, result) {
                if (error)
                    reject(error);


            });

            Account.findOne({ accountId: accountId }, function (error, account) {
                if (error) {
                    reject(error);
                } else if (account) {
                    //
                    resolve(new QueryResult('Success',));
                } else {
                    resolve(new QueryResult('NotFound', null));
                }
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
}

module.exports = new AccountDAO();