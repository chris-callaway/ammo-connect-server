module.exports = function (Config, Modules) {

    var CronJobs = {};

    CronJobs.scrapers = function (CronJob) {
        console.log('Scrapers CronJob Initiated');
        return new CronJob({
            cronTime: '*/10 * * * *', // 10 minutes
            onTick: function () {
                Modules.ScraperDeployments.init();
            },
            runOnInit: false,
            timeZone: 'America/New_York'
        });
    };

    CronJobs.Tasks = {};
    CronJobs.Tasks.Notifications = {};

    return CronJobs;
};