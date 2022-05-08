//const DAO = require('../dao/coach-trip-dao');

class GeneralController {

    index(req, res){
        if(!req.session.admin)
            return res.redirect('/employee/sign-in');

        return res.render('./admin/general/overview', { layout: 'admin', pageName: 'Trang tổng quan', adminInfo: req.session.admin });
    }
}

module.exports = new GeneralController;