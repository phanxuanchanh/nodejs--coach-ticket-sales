class HomeController {

    index(req, res) {
        res.render('./home/index', { pageName: 'Trang chủ' });
    };

    aboutUs(req, res){
        res.render('./home/about-us', { pageName: 'Về chúng tôi' });
    }

    getDevelopmentTeamMembers(req, res){
        res.render('./home/development-team-members', { pageName: 'Về chúng tôi' });
    }
    
}

module.exports = new HomeController;