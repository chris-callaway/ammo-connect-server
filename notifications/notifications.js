module.exports = function (Config, Modules) {

    var Notifications = {};

    Notifications.SendText = function (params, type) {
        var deferred = Modules.Q.defer();
        params.to = params.to.replace(/[^0-9.]/g, "");
        var obj = {
            body: params.message,
            to: '+1' + params.to,
            from: Config.Twilio.MasterNumberBuy
        };

        Modules.twilioClient.messages.create(obj).then(function (message) {
            deferred.resolve(message);
        });
        return deferred.promise;
    };
    
    Notifications.SendPushNotificationIos = function(params){
    	var deferred = Modules.Q.defer();
    	var note = new Modules.apn.Notification();
    	console.log('params', params);
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = null;
        note.sound = "ping.aiff"; 
        note.alert = "\uD83D\uDCE7 \u2709 " + params.message;
        note.payload = {'messageFrom': 'Ammo Connect'};
        note.topic = "com.ammoconnect";
        apnProvider.send(note, params.tokens).then(function (result) {
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
            console.log('failed', err);
        });
    	return deferred.promise;
    };

    return Notifications;
};