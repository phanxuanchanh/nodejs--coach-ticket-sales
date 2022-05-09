const accountDAO = require('../dao/account-dao');

class CustomerManagementController {

    index(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        let status = null;
        if (req.query.status === 'NotFound')
            status = 'Không tìm thấy khách hàng này!';
        else if (req.query.status === 'Failed')
            status = 'Xóa thất bại!';
        else if (req.query.status === 'Success')
            status = 'Xóa thành công!'
        else if (req.query.status === 'NoPermissionsAllowed')
            status = 'Không có quyền thực hiện!'
        else
            status = null;

        accountDAO.getCustomers().then(customers => res.render('./admin/customer-management/index', {
            layout: 'admin',
            pageName: 'Danh sách khách hàng',
            status: status,
            adminInfo: req.session.admin,
            customers: customers
        })).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    searchCustomers(req, res){
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        accountDAO.searchCustomers(req.query.keyword).then(customers => {
            for(let customer of customers){
                customer.customerId = customer.accountId;
                delete customer.accountId;
                delete customer.password;
                delete customer.isActivated;
                delete customer.deleted;
                delete customer.createdAt;
                delete customer.updatedAt;
            }
            return res.send(customers);
        }).catch(error => res.send('Error'));
    }

    detail(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        accountDAO.getCustomer(req.params.accountId).then(queryResult => { 
            if (queryResult.status === 'NotFound')
                return res.redirect('/admin/customer-management/list');

            return res.render('./admin/customer-management/detail', {
                layout: 'admin', pageName: 'Chi tiết khách hàng', customer: queryResult.content, adminInfo: req.session.admin
            });
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    create(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        if (req.method === 'GET')
            return res.render('./admin/customer-management/create', { layout: 'admin', pageName: 'Tạo mới khách hàng', adminInfo: req.session.admin });

        let account = req.body;
        account.accountType = 'Customer';
        accountDAO.createAccount(account).then(queryResult => {
            if (queryResult.status === 'AlreadyExists')
                return res.render('./admin/customer-management/create', {
                    layout: 'admin', pageName: 'Tạo mới khách hàng', status: 'Đã tồn tại khách hàng này!', adminInfo: req.session.admin
                });
            else if (queryResult.status === 'Failed')
                return res.render('./admin/customer-management/create', {
                    layout: 'admin', pageName: 'Tạo mới khách hàng', status: 'Tạo mới khách hàng không thành công!', adminInfo: req.session.admin
                });
            else
                return res.render('./admin/customer-management/create', {
                    layout: 'admin', pageName: 'Tạo mới khách hàng', status: 'Tạo mới khách hàng thành công!', adminInfo: req.session.admin
                });
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    delete(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        if(req.session.admin.title !== 'Employer')
            return res.redirect('/admin/customer-management/list?status=NoPermissionsAllowed');
        
        accountDAO.deleteAccount(req.body.accountId).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.redirect('/admin/customer-management/list?status=NotFound');
            else if (queryResult.status === 'Failed')
                return res.redirect('/admin/customer-management/list?status=Failed');
            else
                return res.redirect('/admin/customer-management/list?status=Success');
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    }

    count(req, res){
        if(!req.session.admin)
            return res.send('NoPermissionsAllowed')

        accountDAO.countCustomer().then(count => res.send({customerNumber: count})).catch(error => res.send('Error'));
    }
}

module.exports = new CustomerManagementController;