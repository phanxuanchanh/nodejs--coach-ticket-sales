
class EmployeeValidator {

    validateSignIn(req){
        if (req.body.username == undefined || req.body.username === '' || !/^[a-z0-9]{6,24}$/.test(req.body.username))
            return false;
        if(req.body.password == undefined || req.body.password === '')
            return false;

        return true;
    }
}

module.exports = new EmployeeValidator();