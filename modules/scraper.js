module.exports = function (Config, Modules) {

    var self = this;

    this.Scraper = function () {
        this.url = "";
        this.jobId = null;
        this.datePosted = "";
        this.jobTitle = "";
        this.company = "";
        this.jobDescription = "";
        this.status = null;
        this.city = "";
        this.state = "";
        this.zip = "";
        this.closingDate = "";
        return this;
    };

    this.compareUpdate = function (newEntry, oldEntry) {

        var newChanges = {};

        if (!oldEntry) {
            newChanges.price = newEntry.price;
            finish(newEntry);
        } else {
            if (parseFloat(newEntry.price) < parseFloat(oldEntry.price)) {
                newChanges.price = newEntry.price;
                finish(newEntry);
            }
        }

        function finish(entry) {
            Modules.Database.query({query: 'SELECT * FROM notifications a LEFT JOIN tokens b ON a.uuid = b.uuid'}).then(function (notifications) {
                for (var i in notifications) {
                    var isSending = false;
                    if (notifications[i].manufacturer == newEntry.manufacturer || notifications[i].manufacturer == 'All') {
                        isSending = true;
                    }
                    if (notifications[i].retailer == newEntry.retailer || notifications[i].retailer == 'All') {
                        isSending = true;
                    }
                    if (notifications[i].caliber == newEntry.caliber || notifications[i].caliber == 'All') {
                        isSending = true;
                    }
                    if (notifications[i].type == newEntry.type || notifications[i].type == 'All') {
                        isSending = true;
                    }
                    if (notifications[i].rounds == newEntry.rounds || notifications[i].rounds == 'All') {
                        isSending = true;
                    }
                    if (notifications[i].casing == newEntry.casing || notifications[i].casing == 'All') {
                        isSending = true;
                    }

                    if (isSending) { 
                    	console.log('notifications[i].token', notifications[i].token);
                        var message = 'AMMO CONNECT ALERT - The price has lowered for the following item: ';
                        message += newEntry.manufacturer + ' ' + newEntry.caliber + ' ' + newEntry.type + ' ' + newEntry.rounds + ' ' + newEntry.casing + '.  NEW PRICE - ' + newEntry.price + '.  ' + newEntry.url;
                        console.log('Sending text message', message);
                        // Modules.Notifications.Main.SendText({to: notifications[i].phone, message: message});
                        Modules.Notifications.Main.SendPushNotificationIos({tokens: [notifications[i].token], message: message});
                    }
                }
            });
        }
    };

    return this;

};
