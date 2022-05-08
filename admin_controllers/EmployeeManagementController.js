const accountDAO = require('../dao/account-dao');

class EmployeeManagementController {

    index(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        let status = null;
        if (req.query.status === 'NotFound')
            status = 'Không tìm thấy nhân viên này!';
        else if (req.query.status === 'Failed')
            status = 'Xóa thất bại!';
        else if (req.query.status === 'Success')
            status = 'Xóa thành công!'
        else if (req.query.status === 'NoPermissionsAllowed')
            status = 'Không có quyền thực hiện!'
        else
            status = null;

        accountDAO.getEmployees().then(employees => res.render('./admin/employee-management/index', {
            layout: 'admin',
            pageName: 'Danh sách nhân viên',
            status: status,
            adminInfo: req.session.admin,
            employees: employees
        })).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    detail(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        accountDAO.getEmployee(req.params.accountId).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.redirect('/admin/employee-management/list');
            
            queryResult.content.title = queryResult.content.accountType;
            delete queryResult.content.accountType;

            return res.render('./admin/employee-management/detail', {
                layout: 'admin', pageName: 'Chi tiết nhân viên', adminInfo: req.session.admin, employee: queryResult.content
            });
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    create(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        if (req.method === 'GET')
            return res.render('./admin/employee-management/create', { layout: 'admin', pageName: 'Tạo mới nhân viên', adminInfo: req.session.admin });

        let account = req.body;
        account.accountType = account.title;
        delete account.title;

        accountDAO.createAccount(req.body).then(queryResult => {
            if (queryResult.status === 'AlreadyExists')
                return res.render('./admin/employee-management/create', {
                    layout: 'admin', pageName: 'Tạo mới nhân viên', status: 'Đã tồn tại nhân viên này!', adminInfo: req.session.admin
                });
            else if (queryResult.status === 'Failed')
                return res.render('./admin/employee-management/create', {
                    layout: 'admin', pageName: 'Tạo mới nhân viên', status: 'Tạo mới nhân viên không thành công!', adminInfo: req.session.admin
                });
            else
                return res.render('./admin/employee-management/create', {
                    layout: 'admin', pageName: 'Tạo mới nhân viên', status: 'Tạo mới nhân viên thành công!', adminInfo: req.session.admin
                });
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    edit(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        if(req.session.admin.title !== 'Employer')
            return res.redirect('/admin/employee-management/list?status=NoPermissionsAllowed');

        if (req.method === 'GET') {
            accountDAO.getEmployee(req.params.accountId).then(queryResult => {
                if (queryResult.status === 'NotFound')
                    return res.redirect('/admin/employee-management/list?status=NotFound');
                else {
                    queryResult.content.title = queryResult.content.accountType;
                    delete queryResult.content.accountType;

                    if(queryResult.content.birthday)
                        queryResult.content.birthday_formatted = queryResult.content.birthday.toISOString().split('T')[0];
                        
                    return res.render('./admin/employee-management/edit', {
                        layout: 'admin', pageName: 'Chỉnh sửa nhân viên', employee: queryResult.content, adminInfo: req.session.admin
                    });
                }
            }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
        } else {
            let account = req.body;
            account.accountType = account.title;
            delete account.title;

            accountDAO.updateAccount(account).then(queryResult => {
                if (queryResult.status === 'NotFound')
                    return res.redirect('/admin/employee-management/list?status=NotFound');
                else if (queryResult.status === 'Failed')
                    return res.redirect('/admin/employee-management/list?status=Failed');
                else
                    return res.render('./admin/employee-management/edit', {
                        layout: 'admin', pageName: 'Chỉnh sửa nhân viên', status: "Chỉnh sửa thành công", employee: queryResult.content, adminInfo: req.session.admin
                    });
            }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));;
        }
    }

    delete(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        if(req.session.admin.title !== 'Employer')
            return res.redirect('/admin/employee-management/list?status=NoPermissionsAllowed');

        accountDAO.deleteAccount(req.body.accountId).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.redirect('/admin/employee-management/list?status=NotFound');
            else if (queryResult.status === 'Failed')
                return res.redirect('/admin/employee-management/list?status=Failed');
            else
                return res.redirect('/admin/employee-management/list?status=Success');
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    }

    count(req, res){
        if(!req.session.admin)
            return res.send('NoPermissionsAllowed')

        accountDAO.countEmployee().then(count => res.send({employeeNumber: count})).catch(error => res.send('Error'));
    }
}

module.exports = new EmployeeManagementController;