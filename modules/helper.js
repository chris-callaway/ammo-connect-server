module.exports = function (Config, Modules) {

    var Helper = {};

    Helper.encryptStr = function (str) {
        var cipher = Modules.crypto.createCipher(Modules.algorithm, Modules.cryptoPassword);
        var crypted = cipher.update(str, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    };

    Helper.decryptStr = function (str) {
        var decipher = Modules.crypto.createDecipher(Modules.algorithm, Modules.cryptoPassword);
        var dec = decipher.update(str, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    };

    Helper.validateRequiredFields = function (fields, object) {
        var validate = function (value) {
            return (object.hasOwnProperty(value) && object[value])
        };
        return fields.every(validate);
    };

    Helper.saveMetricProcess = function (process) {
        var deferred = Modules.Q.defer();
        var date = Modules.moment(new Date()).tz("America/New_York").format();
        Modules.Database.insert({
            table: 'data_tracker',
            database: 'Sync',
            obj: {process: process, modified: date}
        });
        deferred.resolve();
        return deferred.promise;
    };

    Helper.sendEmail = function (params) {

        var messageBody = '<table style="width:600px;font-family:helvetica;border:1px solid #efefef;margin:0 auto;" cellpadding="0" cellspacing="0"><tr style="background:#444444;"><td><h1 style="font-weight:bold;font-size:20px;color:#ffffff;background:#444444;padding:15px;margin:0;">Altus Jobs Tools</h1></td></tr><tr><td style="padding:30px 20px;"><div style="text-align:center;"><img src="http://altusjobstools.com/img/tools_logo.png" alt="Altus Jobs Tools" width="63" height="80" style="height:80px; width: 63px;" /></div><div style="padding:20px 0;">' + params.message + '</div><br /><br /><hr /><br /><br /><div style="text-align:center;margin:0 auto;"><a target="_blank" href="https://www.facebook.com/Altus-Jobs-LLC-112499672171936/" title="Facebook"><img src="http://www.altusjobs.com/wp-content/uploads/2018/06/facebook-4.png" width="35" height="35" style="width: 35px; height: 35px;"></a>&nbsp;<a target="_blank" href="https://twitter.com/altusjobs" title="Twitter"><img src="http://www.altusjobs.com/wp-content/uploads/2018/06/twitter.png" width="35" height="35"  style="width: 35px; height: 35px;"></a>&nbsp;<a target="_blank" href="https://www.youtube.com/channel/UCRmleFSyFfdG6os7ALr5r_g" title="YouTube"><img src="http://www.altusjobs.com/wp-content/uploads/2018/06/youtube.png" width="35" height="35" style="width: 35px; height: 35px;"></a>&nbsp;<a target="_blank" href="https://www.linkedin.com/company/altus-jobs" title="LinkedIn"><img src="http://www.altusjobs.com/wp-content/uploads/2018/06/linkedin.png" width="35" height="35" style="width: 35px; height: 35px;"></a>&nbsp;<a target="_blank" href="https://www.instagram.com/altusglobal/" title="Instagram"><img src="http://www.altusjobs.com/wp-content/uploads/2018/06/instagram-2.png" width="35" height="35" style="width: 35px; height: 35px;"></a></div></td></tr><tr style="background:#444444;color:#ffffff;"><td style="padding:15px;font-size:12px;text-align:center;">&copy; 2019 Altus Tools Jobs. All Rights Reserved</td></tr></table>';


        var deferred = Modules.Q.defer();
        //var opts = {
        //    url: 'http://altusjobstools.com/misc/mailer.php',
        //    method: "POST",
        //    form: {
        //        from: params.from ? params.from : 'automations@altusjobs.com',
        //        message: messageBody,
        //        fromName: 'Altus Jobs',
        //        to: params.to,
        //        subject: params.subject,
        //        cc: params.cc,
        //        receiptId: params.receiptId,
        //        attachments: params.attachmentType
        //    }
        //};
        //
        //Modules.request(opts, function (err, resp, body) {
        //    if (err) {
        //        deferred.reject(err);
        //    } else {
        //        if (body.trim() == 'Success') {
        //            console.log('Sent email to ' + opts.form.to);
        //            console.log('Sent email to ' + opts.form.cc + ' (CC)');
        //            deferred.resolve();
        //        } else {
        //            deferred.reject(body);
        //        }
        //    }
        //});
        deferred.resolve();

        return deferred.promise;
    };

    Helper.htmlEntities = function (str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    Helper.getDifferenceInPercent = function (a, b) {
        a = parseFloat(a);
        b = parseFloat(b);
        var absolute = Math.abs(a - b);
        var added = a + b;
        var divided = added / 2;
        var percentage = (absolute / divided) * 100;
        return percentage;
    };

    Helper.formatArgs = function (args) {
        return [Modules.util.format.apply(Modules.util.format, Array.prototype.slice.call(args))];
    };


    Helper.createCommissionAdditionsEntriesForUser = function (user_id) {

        var deferred = Modules.Q.defer();

        Modules.Database.query({query: 'SELECT user_id, date, additional_bonus, bonus_note from commission_tracker WHERE user_id="' + user_id + '" '}).then(function (trackersRows) {

            if (trackersRows.length > 0) {

                var prom = [];

                for (var i = 0; i < trackersRows.length; i++) {
                    prom.push(Helper.saveCommissionAdditions(trackersRows[i]));
                }

                Modules.Q.all(prom).then(function () {
                    deferred.resolve();
                });

            }
            else {
                deferred.resolve();
            }

        });

        return deferred.promise;

    };

    Helper.saveCommissionAdditions = function (item) {

        var deferred = Modules.Q.defer();

        Modules.Database.insert({
            table: 'commission_additions', obj: {
                user_id: item.user_id,
                amount: item.additional_bonus,
                note: item.bonus_note,
                pay_period: item.date
            }
        }).then(function () {
            console.log('Saved addition record for ', item);
            deferred.resolve();
        }, function (err) {
            deferred.reject(err)
        });

        return deferred.promise;
    };


    Helper.createCommissionDeductionsEntriesForUser = function (user_id) {

        var deferred = Modules.Q.defer();

        Modules.Database.query({query: 'SELECT user_id, date, misc_deductions, deductions_note from commission_tracker WHERE user_id="' + user_id + '" '}).then(function (trackersRows) {

            if (trackersRows.length > 0) {

                var prom = [];

                for (var i = 0; i < trackersRows.length; i++) {
                    prom.push(Helper.saveCommissionDeductions(trackersRows[i]));
                }

                Modules.Q.all(prom).then(function () {
                    deferred.resolve();
                });

            }
            else {
                deferred.resolve();
            }

        });

        return deferred.promise;

    };

    Helper.saveCommissionDeductions = function (item) {

        var deferred = Modules.Q.defer();

        Modules.Database.insert({
            table: 'commission_deductions', obj: {
                user_id: item.user_id,
                amount: item.misc_deductions,
                note: item.deductions_note,
                pay_period: item.date
            }
        }).then(function () {
            deferred.resolve();
        }, function (err) {
            deferred.reject(err)
        });

        return deferred.promise;
    };


    Helper.populateAdditionsDeductionsData = function () {

        var deferred = Modules.Q.defer();

        // select all users

        Modules.Database.query({query: 'SELECT * FROM users'}).then(function (users) {

            if (users.length > 0) {

                var prom = [];

                for (var i = 0; i < users.length; i++) {
                    Helper.createCommissionAdditionsEntriesForUser(users[i].id);
                    Helper.createCommissionDeductionsEntriesForUser(users[i].id);
                }

                Modules.Q.all(prom).then(function () {
                    console.log('Finished populating additions/deductions');
                    deferred.resolve();
                });

            }

        });

        return deferred.promise;
    };


    return Helper;

};