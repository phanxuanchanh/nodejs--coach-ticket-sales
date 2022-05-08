module.exports = {

    convertDateToString: function (datetime){
        let date = ("0" + datetime.getDate()).slice(-2);
        let month = ("0" + (datetime.getMonth() + 1)).slice(-2);
        let year = datetime.getFullYear();
        let hours =datetime.getHours();
        let minutes = datetime.getMinutes();
        let seconds = datetime.getSeconds();

        return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    },

    getStringCurrentDateTime: function () {
        let date_ob = new Date();
        return this.convertDateToString(date_ob);
    }
}