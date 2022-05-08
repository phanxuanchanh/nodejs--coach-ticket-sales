const coachTicketDAO = require('../dao/coach-ticket-dao');
const accountDAO = require('../dao/account-dao');
const coachTripDAO = require('../dao/coach-trip-dao');
const { convertDateToString } = require('../utilities/datetime_utility');
const mailUtility = require('../utilities/mail_utility');

class CoachTicketController {

    index(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        let status = null;
        if (req.query.status === 'NotFound')
            status = 'Không tìm thấy vé xe này!';
        else if (req.query.status === 'Failed')
            status = 'Xóa thất bại!';
        else if (req.query.status === 'Success')
            status = 'Xóa thành công!'
        else
            status = null;

        coachTicketDAO.getCoachTickets().then(coachTickets => res.render('./admin/coach-ticket-management/index', {
            layout: 'admin',
            pageName: 'Danh sách vé xe',
            status: status,
            adminInfo: req.session.admin,
            coachTickets: coachTickets
        })).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    detail(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        coachTicketDAO.getCoachTicket(req.params.coachTicketId).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.redirect('/admin/coach-ticket-management/list');

            queryResult.content.createdAt_formatted = convertDateToString(queryResult.content.createdAt);
            queryResult.content.Payment.purchaseDate_formatted = convertDateToString(queryResult.content.Payment.purchaseDate);
            return res.render('./admin/coach-ticket-management/detail', {
                layout: 'admin', pageName: 'Chi tiết vé xe', coachTicket: queryResult.content, adminInfo: req.session.admin
            });
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    };

    sendInvoiceToCustomer(req, res){
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        coachTicketDAO.getCoachTicket(req.params.coachTicketId).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.redirect('/admin/coach-ticket-management/list');

            queryResult.content.createdAt_formatted = convertDateToString(queryResult.content.createdAt);
            queryResult.content.Payment.purchaseDate_formatted = convertDateToString(queryResult.content.Payment.purchaseDate);
            mailUtility.sendInvoice(queryResult.content);
            return res.redirect(`/admin/coach-ticket-management/detail/${queryResult.content.coachTicketId}`);
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));

    }

    getAvailableSeatPositionList(req, res){
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        coachTripDAO.getAvailableSeatPositionList(req.params.coachTripId).then(queryResult => {
            if(queryResult.status === 'NotFound')
                return res.send('NotFound');
            
            return res.send(queryResult.content);
        }).catch(error => res.send('Error'));
    }

    sellTicket(req, res){
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        if(req.method === 'GET')
            return res.render('./admin/coach-ticket-management/sell-ticket', { layout: 'admin', pageName: 'Bán vé cho khách hàng', adminInfo: req.session.admin });
        
        accountDAO.addTicketToCustomer(req.body.customerId, req.body);

        coachTicketDAO.createCoachTicket(req.body).then(queryResult => {
            if(queryResult.status === 'Failed')
                return res.render('./admin/coach-ticket-management/sell-ticket', {
                    layout: 'admin', pageName: 'Bán vé cho khách hàng', status: 'Đã lập vé thất bại!', adminInfo: req.session.admin
                });
            else
                return res.render('./admin/coach-ticket-management/sell-ticket', {
                    layout: 'admin', pageName: 'Bán vé cho khách hàng', status: 'Đã lập vé thành công!', adminInfo: req.session.admin
                });
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    }

    delete(req, res) {
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');
        
        if(req.session.admin.title !== 'Employer')
            return res.redirect('/admin/customer-management/list?status=NoPermissionsAllowed');

        coachTicketDAO.deleteCoachTicket(req.body.coachTicketId).then(queryResult => {
            if (queryResult.status === 'NotFound')
                return res.redirect('/admin/coach-ticket-management/list?status=NotFound');
            else if (queryResult.status === 'Failed')
                return res.redirect('/admin/coach-ticket-management/list?status=Failed');
            else
                return res.redirect('/admin/coach-ticket-management/list?status=Success');
        }).catch(error => res.render('./admin/error', { layout: 'admin', pageName: 'Lỗi', err: error }));
    }

    count(req, res){
        if(!req.session.admin)
            return res.send('NoPermissionsAllowed')
        
        coachTicketDAO.countCoachTicket().then(count => res.send({coachTicketNumber: count})).catch(error => res.send('Error'));
    }
}

module.exports = new CoachTicketController();