const Account = require('../models/account');
const CoachTrip = require('../models/coach-trip');
const { mongooseToObject, multipleMongooseToObject } = require('../utilities/mongoose-utility');
const QueryResult = require('./query-status');
const randomUtility = require('../utilities/random_utility');
const md5 = require('md5');

class CoachTripDAO {

    getCoachTrips() {
        return new Promise((resolve, reject) => {
            CoachTrip.find({}, function (error, coachTrips) {
                if (error)
                    reject(error);

                resolve(multipleMongooseToObject(coachTrips));
            });
        });
    }

    searchCoachTrips(keyword) {
        return new Promise((resolve, reject) => {
            CoachTrip.find({ $and: [ 
                { $or: [
                    { name: { $regex: keyword, $options:"i" }}, 
                    { 'Coach.name': { $regex: keyword, $options:"i" }}, 
                    { 'Route.name': { $regex: keyword, $options:"i" }}
                ]},
                { status: false }
            ]}, function (error, coachTrips) {
                if (error)
                    reject(error);
                
                resolve(multipleMongooseToObject(coachTrips));
            });
        });
    }

    getCoachTrip(coachTripId) {
        return new Promise((resolve, reject) => {
            CoachTrip.findOne({ coachTripId: coachTripId }, function (error, coachTrip) {
                if (error)
                    reject(error);
                else if (coachTrip)
                    resolve(new QueryResult('Success', mongooseToObject(coachTrip)));
                else
                    resolve(new QueryResult('NotFound', null));
            });
        });
    }

    getAvailableSeatPositionList(coachTripId) {
        return new Promise((resolve, reject) => { 
            CoachTrip.findOne({ coachTripId: coachTripId }, function (error, coachTrip) {
                if (error) {
                    reject(error);
                } else if (coachTrip) {
                    let seatNumber = coachTrip.Coach.seatNumber;
                    const availableSeatPositionList = new Array(seatNumber);
                    let count = 0;

                    for (let i = 1; i <= seatNumber; i++) {
                        Account.count({ $and: [ 
                            { "Tickets.CoachTrip.coachTripId": coachTripId }, 
                            { "Tickets.TicketDetail.seatPosition": i } 
                        ]}, function(error, result){
                            if (error)
                                reject(error);

                            if(result == 0)
                                availableSeatPositionList[count++] = i;
                        });                        
                    }

                    resolve(new QueryResult('Success', availableSeatPositionList));

                    // CoachTicket.find({ 'CoachTrip.coachTripId': coachTripId }, function (error2, coachTickets) {
                    //     if (error2)
                    //         reject(error2);

                    //     let availableSeatPositionList = new Array(seatNumber - coachTickets.length);
                    //     let count = 0;
                    //     if (coachTickets.length > 0) {
                    //         for (let i = 1; i <= seatNumber; i++) {
                    //             let checkExists = false;
                    //             for (let coachTicket of coachTickets) {    
                    //                 if (parseInt(coachTicket.TicketDetail.seatPosition) === i)
                    //                     checkExists = true;
                    //             }
                    //             if(!checkExists)
                    //                 availableSeatPositionList[count++] = i;
                    //         }
                    //     } else {
                    //         for (let i = 1; i <= seatNumber; i++) {
                    //             availableSeatPositionList[count++] = i;
                    //         }
                    //     }

                    //     resolve(new QueryResult('Success', availableSeatPositionList));
                    // });
                } else {
                    resolve(new QueryResult('NotFound', null));
                }
            });
        });
    }

    checkAvailableSeatPosition(coachTripId, seatPosition){
        return new Promise((resolve, reject) => {
            Account.count({ $and: [ 
                { "Tickets.CoachTrip.coachTripId": coachTripId }, 
                { "Tickets.TicketDetail.seatPosition": seatPosition } 
            ]}, function(error, result){
                if (error)
                    reject(error);
                
                resolve(result == 0);
            });
        });
    }

    createCoachTrip(item) {
        return new Promise((resolve, reject) => {
            CoachTrip.findOne({ $or: [{ code: item.code, name: item.name }] }, function (error, coachTrip) {
                if (error) {
                    reject(error);
                } else if (coachTrip) {
                    resolve(new QueryResult('AlreadyExists', null));
                } else {
                    let newCoachTrip = new CoachTrip(item);
                    newCoachTrip.coachTripId = md5(`${newCoachTrip.name}///${randomUtility.getRandomString(24)}`);
                    newCoachTrip.status = false;
                    newCoachTrip.save(function (error2, result) {
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

    updateCoachTrip(item) {
        return new Promise((resolve, reject) => {
            CoachTrip.findOne({ coachTripId: item.coachTripId }, function (error, coachTrip) {
                if (error) {
                    reject(error);
                } else if (coachTrip) {
                    let coachTrip_fromFormData = new CoachTrip(item);

                    coachTrip.name = coachTrip_fromFormData.name;
                    coachTrip.departureTime = coachTrip_fromFormData.departureTime;
                    coachTrip.destinationTime = coachTrip_fromFormData.destinationTime;
                    coachTrip.Coach.name = coachTrip_fromFormData.Coach.name;
                    coachTrip.Coach.seatNumber = coachTrip_fromFormData.Coach.seatNumber;
                    coachTrip.Coach.licensePlate = coachTrip_fromFormData.Coach.licensePlate;
                    coachTrip.Route.name = coachTrip_fromFormData.Route.name;
                    coachTrip.Route.price = coachTrip_fromFormData.Route.price;
                    coachTrip.status = coachTrip_fromFormData.status;

                    coachTrip.save(function (error2, result) {
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

    deleteCoachTrip(coachTripId) {
        return new Promise((resolve, reject) => {
            CoachTrip.findOne({ coachTripId: coachTripId }, function (error, coachTrip) {
                if (error) {
                    reject(error);
                } else if (coachTrip) {
                    coachTrip.remove(function (error2, result) {
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

    countCoachTrip(){
        return new Promise((resolve, reject) => {
            CoachTrip.countDocuments({}, function (error, count) {
                if (error) {
                    reject(error);
                }
                
                resolve(count);
            });
        });
    }
}

module.exports = new CoachTripDAO();