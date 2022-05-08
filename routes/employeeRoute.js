const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/EmployeeController');

router.get('/sign-in', employeeController.signIn);
router.post('/sign-in', employeeController.signIn);
router.get('/verify-account', employeeController.verifyAccount);
router.post('/verify-account', employeeController.verifyAccount);

module.exports = router;