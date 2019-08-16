module.exports = function (Config, Modules) {

    this.SendText = function (params, type) {
        var deferred = Modules.Q.defer();
        params.to = params.to.replace(/[^0-9.]/g, "");
        var obj = {
            body: params.message,
            to: '+1' + params.to
        };

        switch (type) {
            case 'buy':
                obj.from = Config.Twilio.MasterNumberBuy;
                break;
            case 'sell':
                obj.from = Config.Twilio.MasterNumberSell;
                break;
            case 'warning':
                obj.from = Config.Twilio.MasterNumberWarning;
                break;
            default:
                obj.from = Config.Twilio.MasterNumberBuy;
        }

        Modules.twilioClient.messages.create(obj).then(function (message) {
            deferred.resolve(message);
        });
        return deferred.promise;
    };

    return this;
};