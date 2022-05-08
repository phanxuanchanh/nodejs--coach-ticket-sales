const Employeee = require('../models/employee');
const bcrypt = require('bcrypt');
const accountDAO = require('../dao/account-dao');
const mailUtility = require('../utilities/mail_utility');
const randomUtility = require('../utilities/random_utility');
const employeeValidator = require('../validators/employee_validator');
const md5 = require('md5');

class EmployeeController {
    
    signIn(req, res) {
        if (req.method === 'GET')
            return res.render('./employee/sign-in', { pageName: 'Đăng nhập' });

        if (!employeeValidator.validateSignIn(req))
            return res.render('./employee/sign-in', { pageName: 'Đăng nhập', status: 'Dữ liệu không hợp lệ!' });

        let username = req.body.username;
        let password = req.body.password;
        accountDAO.getEmployeeByUsername(username).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.render('./employee/sign-in', { pageName: 'Đăng nhập', status: 'Không tìm thấy tài khoản này!' });

            let employee = queryResult.content;
            let match = bcrypt.compareSync(password, employee.password);
            if (match && employee.isActivated === true) {
                req.session.admin = { 
                    adminId: employee.accountId, username: employee.username, fullname: employee.fullname, title: employee.accountType };
                mailUtility.sendLoginNotificationMail(employee);
                return res.redirect('/admin/general/overview');
            } else if (match && employee.isActivated === false) {
                req.session.confirmationCode = randomUtility.getRandomString(12);
                mailUtility.sendConfirmationCode(employee, req.session.confirmationCode);
                req.session.token = md5(`accountId: ${employee.accountId}///${randomUtility.getRandomString(24)}`);
                return res.redirect(`/employee/verify-account?accountId=${employee.accountId}&token=${req.session.token}`);
            } else {
                return res.render('./employee/sign-in', { pageName: 'Đăng nhập', status: 'Mật khẩu sai!' });
            }
        }).catch(error => res.render('./employee/error', { layout: 'main', pageName: 'Lỗi', err: error }));
    };
    
    verifyAccount(req, res) {
        if (req.method === 'GET') {
            if (req.query.accountId && req.session.token) {
                return res.render('./employee/verify-account', {
                    pageName: 'Xác minh tài khoản',
                    accountId: req.query.accountId,
                    token: req.session.token
                });
            }

            return res.redirect('/employee/sign-in');
        }

        let accountId = req.body.accountId
        let confirmationCode = req.body.confirmationCode;
        let token = req.query.token;

        if (confirmationCode !== req.session.confirmationCode)
            return res.render('./employee/verify-account', {
                pageName: 'Xác nhận tài khoản',
                accountId: accountId,
                token: token,
                status: 'Mã xác nhận không khớp!'
            });

        accountDAO.updateAccountStatus(accountId, true).then(queryResult => {
            req.session.confirmationCode = 'empty';
            req.session.token = null;
            if (queryResult.status === 'Failed') {
                return res.redirect("/employee/sign-in");
            } else if (queryResult.status === 'Success') {
                req.session.admin = { 
                    adminId: queryResult.content.accountId, username: queryResult.content.username, 
                    fullname: queryResult.content.fullname, title: queryResult.content.title 
                };
                return res.redirect('/admin/general/overview');
            } else {
                return res.redirect("/employee/sign-in");
            }
        }).catch(error => res.render('./employee/error', { layout: 'main', pageName: 'Lỗi', err: error }));
    }
}

module.exports = new EmployeeController;