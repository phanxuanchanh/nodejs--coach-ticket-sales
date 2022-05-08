const coachTripDAO = require('../dao/coach-trip-dao');
const { convertDateToString } = require('../utilities/datetime_utility');

class CoachTripManagementController {

    // [GET] /admin/coach-trip-management/list
    index(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        let status = null;
        if (req.query.status === 'NotFound')
            status = 'Không tìm thấy chuyến xe này!';
        else if (req.query.status === 'Failed')
            status = 'Xóa thất bại!';
        else if (req.query.status === 'Success')
            status = 'Xóa thành công!'
        else if (req.query.status === 'NoPermissionsAllowed')
            status = 'Không có quyền thực hiện!'
        else
            status = null;

        coachTripDAO.getCoachTrips().then(coachTrips => res.render('./admin/coach-trip-management/index', {
            layout: 'admin',
            pageName: 'Danh sách chuyến xe',
            status: status,
            adminInfo: req.session.admin,
            coachTrips: coachTrips
        })).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    searchCoachTrips(req, res){
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        coachTripDAO.searchCoachTrips(req.query.keyword).then(coachTrips => {
            for(let coachTrip of coachTrips){
                delete coachTrip.status;
                delete coachTrip.createdAt;
                delete coachTrip.updatedAt;
                delete coachTrip.deleted;
                coachTrip.departureTime_formatted = convertDateToString(coachTrip.departureTime);
                coachTrip.destinationTime_formatted = convertDateToString(coachTrip.destinationTime);
            }
            return res.send(coachTrips);
        }).catch(error => res.send('Error'));
    }

    getCoachTripPrice(req, res){
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        coachTripDAO.getCoachTrip(req.params.coachTripId).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.send('NotFound');

            return res.send(queryResult.content.Route);
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    }

    // [GET] /admin/coach-trip-management/detail/:coachTripId
    detail(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        coachTripDAO.getCoachTrip(req.params.coachTripId).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.redirect('/admin/coach-trip-management/list');

            return res.render('./admin/coach-trip-management/detail', {
                layout: 'admin', pageName: 'Chi tiết chuyến xe', coachTrip: queryResult.content, adminInfo: req.session.admin
            });
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    // [GET],[POST] /admin/coach-trip/create
    create(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');
        
        if(req.session.admin.title !== 'Employer')
            return res.redirect('/admin/customer-management/list?status=NoPermissionsAllowed');

        if (req.method === 'GET')
            return res.render('./admin/coach-trip-management/create', { layout: 'admin', pageName: 'Tạo mới chuyến xe', adminInfo: req.session.admin });

        coachTripDAO.createCoachTrip(req.body).then(queryResult => {
            if (queryResult.status === 'AlreadyExists')
                return res.render('./admin/coach-trip-management/create', {
                    layout: 'admin', pageName: 'Tạo mới chuyến xe', status: 'Đã tồn tại chuyến xe này!', adminInfo: req.session.admin
                });
            else if (queryResult.status === 'Failed')
                return res.render('./admin/coach-trip-management/create', {
                    layout: 'admin', pageName: 'Tạo mới chuyến xe', status: 'Tạo mới chuyến xe không thành công!', adminInfo: req.session.admin
                });
            else
                return res.render('./admin/coach-trip-management/create', {
                    layout: 'admin', pageName: 'Tạo mới chuyến xe', status: 'Tạo mới chuyến xe thành công!', adminInfo: req.session.admin
                });
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    // [GET],[POST] /admin/coach-trip-management/edit/:coachTripId
    edit(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        if(req.session.admin.title !== 'Employer')
            return res.redirect('/admin/customer-management/list?status=NoPermissionsAllowed');
        
        if (req.method === 'GET') {
            coachTripDAO.getCoachTrip(req.params.coachTripId).then(queryResult => {
                if (queryResult.status === 'NotFound')
                    return res.redirect('/admin/coach-trip-management/list?status=NotFound');
                else
                    return res.render('./admin/coach-trip-management/edit', {
                        layout: 'admin', pageName: 'Chỉnh sửa chuyến xe', coachTrip: queryResult.content, adminInfo: req.session.admin
                    });
            }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
        } else {
            coachTripDAO.updateCoachTrip(req.body).then(queryResult => {
                if (queryResult.status === 'NotFound')
                    return res.redirect('/admin/coach-trip-management/list?status=NotFound');
                else if (queryResult.status === 'Failed')
                    return res.redirect('/admin/coach-trip-management/list?status=Failed');
                else
                    return res.render('./admin/coach-trip-management/edit', {
                        layout: 'admin', pageName: 'Chỉnh sửa chuyến xe', status: "Chỉnh sửa thành công", coachTrip: queryResult.content, adminInfo: req.session.admin
                    });
            }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));;
        }
    }

    // [POST] /admin/coach-trip-management/delete/:coachTripId
    delete(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');
        
        if(req.session.admin.title !== 'Employer')
            return res.redirect('/admin/customer-management/list?status=NoPermissionsAllowed');

        coachTripDAO.deleteCoachTrip(req.body.coachTripId).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.redirect('/admin/coach-trip-management/list?status=NotFound');
            else if (queryResult.status === 'Failed')
                return res.redirect('/admin/coach-trip-management/list?status=Failed');
            else
                return res.redirect('/admin/coach-trip-management/list?status=Success');
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    }

    count(req, res){
        if(!req.session.admin)
            return res.send('NoPermissionsAllowed')

        coachTripDAO.countCoachTrip().then(count => res.send({coachTripNumber: count})).catch(error => res.send('Error'));
    }
}

module.exports = new CoachTripManagementController;