
class CustomerValidator {

    validateSignIn(req){
        if (req.body.phone == undefined || req.body.phone === '' || !/^[0-9]{6,12}$/.test(req.body.phone))
            return false;
        if(req.body.password == undefined || req.body.password === '')
            return false;

        return true;
    }
}

module.exports = new CustomerValidator();