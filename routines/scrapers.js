var Config = require('../modules/config');
var Modules = require('../modules/declarations')(Config);

//Modules.CronJobManager.scrapers(Modules.CronJob).start();
Modules.ScraperDeployments.init();
//Modules.Notifications.Main.SendPushNotificationIos({tokens: ['e6ba08fe663d531c241c9280dcbbbe7178d224bf88f8383d40027d3240e3e025'], message: 'this is a test'});