const express = require('express');
const router = express.Router();
const generalController = require('../admin_controllers/GeneralController');
const employeeManagementController = require('../admin_controllers/EmployeeManagementController');
const customerManagementController = require('../admin_controllers/CustomerManagementController');
const coachTripManagementController = require('../admin_controllers/CoachTripManagementController');
const coachTicketManagementController = require('../admin_controllers/CoachTicketManagementController');

router.get('/general/overview', generalController.index);

router.get('/employee-management/list', employeeManagementController.index);
router.get('/employee-management/detail/:accountId', employeeManagementController.detail);
router.get('/employee-management/create', employeeManagementController.create);
router.post('/employee-management/create', employeeManagementController.create);
router.get('/employee-management/edit/:accountId', employeeManagementController.edit);
router.post('/employee-management/edit/:accountId', employeeManagementController.edit);
router.post('/employee-management/delete/:accountId', employeeManagementController.delete);
router.get('/employee-management/count', employeeManagementController.count);

router.get('/customer-management/list', customerManagementController.index);
router.get('/customer-management/search-customers', customerManagementController.searchCustomers);
router.get('/customer-management/detail/:accountId', customerManagementController.detail);
router.get('/customer-management/create', customerManagementController.create);
router.post('/customer-management/create', customerManagementController.create);
router.post('/customer-management/delete/:accountId', customerManagementController.delete);
router.get('/customer-management/count', customerManagementController.count);

router.get('/coach-trip-management/list', coachTripManagementController.index);
router.get('/coach-trip-management/search-coach-trips', coachTripManagementController.searchCoachTrips);
router.get('/coach-trip-management/get-coach-trip-price/:coachTripId', coachTripManagementController.getCoachTripPrice);
router.get('/coach-trip-management/detail/:coachTripId', coachTripManagementController.detail);
router.get('/coach-trip-management/create', coachTripManagementController.create);
router.post('/coach-trip-management/create', coachTripManagementController.create);
router.get('/coach-trip-management/edit/:coachTripId', coachTripManagementController.edit);
router.post('/coach-trip-management/edit/:coachTripId', coachTripManagementController.edit);
router.post('/coach-trip-management/delete/:coachTripId', coachTripManagementController.delete);
router.get('/coach-trip-management/count', coachTripManagementController.count);

router.get('/coach-ticket-management/list', coachTicketManagementController.index);
router.get('/coach-ticket-management/detail/:coachTicketId', coachTicketManagementController.detail);
router.get('/coach-ticket-management/send-invoice-to-customer/:coachTicketId', coachTicketManagementController.sendInvoiceToCustomer);
router.get('/coach-ticket-management/get-available-seat-position-list/:coachTripId', coachTicketManagementController.getAvailableSeatPositionList);
router.get('/coach-ticket-management/sell-ticket', coachTicketManagementController.sellTicket);
router.post('/coach-ticket-management/sell-ticket', coachTicketManagementController.sellTicket);
router.post('/coach-ticket-management/delete', coachTicketManagementController.delete);
router.get('/coach-ticket-management/count', coachTicketManagementController.count);


module.exports = router;