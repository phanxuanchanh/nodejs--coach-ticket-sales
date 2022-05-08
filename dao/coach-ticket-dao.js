const CoachTicket = require('../models/coach-ticket');
const CoachTrip = require('../models/coach-trip');
const { mongooseToObject, multipleMongooseToObject } = require('../utilities/mongoose-utility');
const QueryResult = require('./query-status');
const randomUtility = require('../utilities/random_utility');
const md5 = require('md5');

class CoachTicketDAO {

    getCoachTickets() {
        return new Promise((resolve, reject) => {
            CoachTicket.find({}, function (error, coachTickets) {
                if (error)
                    reject(error);

                resolve(multipleMongooseToObject(coachTickets));
            });
        });
    }

    getCoachTicket(coachTicketId) {
        return new Promise((resolve, reject) => {
            CoachTicket.findOne({ coachTicketId: coachTicketId }, function (error, coachTicket) {
                if (error)
                    reject(error);
                else if (coachTicket)
                    resolve(new QueryResult('Success', mongooseToObject(coachTicket)));
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
                    CoachTicket.find({ 'CoachTrip.coachTripId': coachTripId }, function (error2, coachTickets) {
                        if (error2)
                            reject(error2);

                        let availableSeatPositionList = new Array(seatNumber - coachTickets.length);
                        let count = 0;
                        if (coachTickets.length > 0) {
                            for (let i = 1; i <= seatNumber; i++) {
                                let checkExists = false;
                                for (let coachTicket of coachTickets) {    
                                    if (parseInt(coachTicket.TicketDetail.seatPosition) === i)
                                        checkExists = true;
                                }
                                if(!checkExists)
                                    availableSeatPositionList[count++] = i;
                            }
                        } else {
                            for (let i = 1; i <= seatNumber; i++) {
                                availableSeatPositionList[count++] = i;
                            }
                        }

                        resolve(new QueryResult('Success', availableSeatPositionList));
                    });
                } else {
                    resolve(new QueryResult('NotFound', null));
                }
            });
        });
    }


    createCoachTicket(item) {
        return new Promise((resolve, reject) => {
            let coachTicket = new CoachTicket(item);
            coachTicket.coachTicketId = md5(`${coachTicket.CustomercustomerName}&${coachTicket.CoachTrip.coachTripName}///${randomUtility.getRandomString(24)}`);
            if(coachTicket.Payment.status === 'Success')
                coachTicket.Payment.purchaseDate = new Date();
            
            coachTicket.save(function (error2, result) {
                if (error2) {
                    reject(error2);
                } else {
                    if (result)
                        resolve(new QueryResult('Success', mongooseToObject(result)));
                    else
                        resolve(new QueryResult('Failed', null));
                }
            });
        });
    }

    updateCoachTicket(item) {
        return new Promise((resolve, reject) => {
            CoachTicket.findOne({ coachTicketId: item.coachTicketId }, function (error, coachTicket) {
                if (error) {
                    reject(error);
                } else if (coachTicket) {
                    let coachTicket_fromFormData = new CoachTicket(item);

                    coachTicket.name = coachTicket_fromFormData.name;
                    coachTicket.departureTime = coachTicket_fromFormData.departureTime;
                    coachTicket.destinationTime = coachTicket_fromFormData.destinationTime;
                    coachTicket.Coach.name = coachTicket_fromFormData.Coach.name;
                    coachTicket.Coach.seatNumber = coachTicket_fromFormData.Coach.seatNumber;
                    coachTicket.Coach.licensePlate = coachTicket_fromFormData.Coach.licensePlate;
                    coachTicket.Route.name = coachTicket_fromFormData.Route.name;
                    coachTicket.Route.price = coachTicket_fromFormData.Route.price;
                    coachTicket.status = coachTicket_fromFormData.status;

                    coachTicket.save(function (error2, result) {
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

    deleteCoachTicket(coachTicketId) {
        return new Promise((resolve, reject) => {
            CoachTicket.findOne({ coachTicketId: coachTicketId }, function (error, coachTicket) {
                if (error) {
                    reject(error);
                } else if (coachTicket) {
                    coachTicket.remove(function (error2, result) {
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

    countCoachTicket(){
        return new Promise((resolve, reject) => {
            CoachTicket.countDocuments({}, function (error, count) {
                if (error) {
                    reject(error);
                }
                
                resolve(count);
            });
        });
    }
}

module.exports = new CoachTicketDAO();