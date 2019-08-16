module.exports = function (Config, Modules) {

    var self = this;

    this.init = function () {
        Modules.Scrapers.Carolinamunitions.runProcess().then(function () {
            console.log('Scraper Carolinamunitions Success');
        }, function (err) {
            console.log('Scraper Carolinamunitions Failed', err);
        });

    };

    return this;
};