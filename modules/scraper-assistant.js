module.exports = function (Config, Modules) {

    var self = this;

    this.isFirstDeployment = function (identifier) {
        var deferred = Modules.Q.defer();
        Modules.Database.query({query: 'SELECT id, value FROM codes where name = "' + identifier + '"'}).then(function (result) {
            if (result && result[0]) {
                var active = result[0].value;
                if (active && active !== '0') {
                    deferred.resolve(false);
                } else {
                    deferred.resolve(result[0].id);
                }
            } else {
                // save initial entry
                Modules.Database.insert({
                    table: 'codes',
                    obj: {name: identifier, value: '1'}
                }).then(function (resultId) {
                    deferred.resolve(resultId);
                }, function (err) {
                    deferred.reject(err);
                });
            }
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    this.deploy = function (scraper) {
        var deferred = Modules.Q.defer();
        scraper.scrapePage(scraper).then(function (response) {
            deferred.resolve(response);
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    this.sendNotification = function (output) {
        var deferred = Modules.Q.defer();
        var to = 'chris@gensie.com';
        var subject = 'Ammo Connect Alert';
        var cc = '';

        var message = output.emailBody;
        Modules.Helper.sendEmail({to: to, subject: subject, message: message, cc: cc}).then(function () {
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    this.run = function (Scraper, deferred, scraperRef) {
        self.isFirstDeployment(Scraper.initIdentifier).then(function (initialRun) {
            self.deploy(scraperRef).then(function (results) {
                scraperRef.determineIfListIsComplete(results).then(function (result) {
                    if (result.isComplete) {
                        console.log('Returned successful results');
                        deferred.resolve();
                    } else {
                        // pagination loop
                    }
                }, function (err) {
                    deferred.reject(err);
                })
            }, function (err) {
                deferred.reject(err);
            });
        }, function (err) {
            deferred.reject(err);
        });
    };

    this.finish = function (Scraper, output, initialRun, deferred) {

    };

    return self;
};