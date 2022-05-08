class SMSContentUtility {

    getInvoiceSMSContent(invoiceId, timestamp) {
        let firstLine = `Bạn đã mua vé thành công với mã hóa đơn là ${invoiceId}`;
        let secondLine = `+ Thời gian:  ${timestamp}`;
        let thirdLine = `+ `;
        return `${firstLine}\n\n${secondLine}\n${thirdLine}`;
    }
}


module.exports = new SMSContentUtility();