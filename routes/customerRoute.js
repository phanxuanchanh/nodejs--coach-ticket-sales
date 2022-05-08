const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerController');

router.get('/sign-in', customerController.signIn);
router.post('/sign-in', customerController.signIn);
router.get('/sign-up', customerController.signUp);
router.post('/sign-up', customerController.signUp);
router.get('/verify-account', customerController.verifyAccount);
router.post('/verify-account', customerController.verifyAccount);
router.get('/buy-ticket', customerController.buyTicket);

module.exports = router;