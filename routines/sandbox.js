var Config = require('../modules/config');
var Modules = require('../modules/declarations')(Config);

Modules.Scrapers.Carolinamunitions.runProcess().then(function () {
    console.log('Finished');
}, function (err) {
    console.log(err);
});

//Modules.Notifications.Main.SendText({to: '4074466838', message: 'testing'});