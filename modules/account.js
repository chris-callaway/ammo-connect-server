module.exports = function (Config, Modules) {

    var Account = {};

    Account.createAccount = function (params) {
        var deferred = Modules.Q.defer();
        var hashedPassword = Modules.Helper.encryptStr(params.password);
        Modules.Database.query({query: 'SELECT * FROM users'}).then(function (rows) {
            if (rows) {
                var obj = {
                    firstname: parsedResponse.firstname,
                    lastname: parsedResponse.lastname,
                    email: parsedResponse.email,
                    password: hashedPassword,
                    phone: parsedResponse.phone,
                    level: parsedResponse.type
                };
                Modules.Database.insert({'table': 'users', obj: obj}).then(function (result) {
                    // add to roles tables
                    if (params.type) {
                        var insertId = result.insertId;
                        Modules.Database.insert({table: params.type, obj: {userId: insertId}}).then(function (result) {
                            var resultId = result.insertId;
                            if (params.validateEmail) {
                                var verificationCode = Math.floor(Math.random() * 10000) + 99999;
                                Modules.Database.update({
                                    table: params.table,
                                    id: params.id ? params.id : resultId,
                                    'setAllObj': {'userId': insertId, 'assigned': '1', email: params.email},
                                }).then(function () {
                                    Modules.Database.update({
                                        table: 'users',
                                        id: insertId,
                                        'setAllObj': {'verification_code': verificationCode}
                                    }).then(function () {
                                        // send email to register
                                        var url = "http://altusjobstools.com/validate?userId=" + Modules.Helper.encryptStr(insertId.toString()) + "&code=" + Modules.Helper.encryptStr(verificationCode.toString());
                                        var message = params.firstname + ',<br /><br />Thank you for registering with Altus Jobs Tools.  In order to activate your account visit this <a href="' + url + '">URL</a> and then log in.';
                                        message += '<br /><br /><span style="font-size: 14px;">Thank you,</span><div style="color: rgb(0, 0, 0); font-family: Calibri,sans-serif; font-style: normal; font-variant-caps: normal; font-weight:normal; letter-spacing: normal; text-align: start;text-indent: 0px; text-transform: none; white-space: normal; word-spacing: 0px; -webkit-text-stroke-width: 0px; font-size:11pt; margin: 0in 0in 0.0001pt;"><span style="font-size: 24pt;font-family: Impact, sans-serif; color: rgb(7, 68, 191);">ALTUS JOBS</span></div><p style="font-size: 16px; margin-top: 0; margin-bottom: 0;font-weight: bold;">2600 Lake Lucien Dr. STE 109<br />Maitland, FL 32751</p><span style="background: yellow;margin-top: 3px; margin-bottom: 0;font-size:18px;">Visit below and share new top priority hiring needs in less than 3 minutes:</span><br /><p style="margin-top: 0; margin-bottom: 0;"><a style="font-size:16px;" target="_blank" href="http://www.altusjobs.com/job-reqs" >www.altusjobs.com/job-reqs</a>&nbsp;(mobile friendly)</p><br />';
                                        Modules.Helper.sendEmail({
                                            to: params.email,
                                            subject: 'Altus Jobs Tools Registration Verification', message: message
                                        }).then(function (resp) {
                                            deferred.resolve();

                                        }, function (err) {
                                            deferred.reject(err);
                                        });
                                    }, function (err) {
                                        deferred.reject(err);
                                    });
                                }, function (err) {
                                    deferred.reject(err);
                                });
                            } else {
                                deferred.resolve();
                            }
                        });
                    } else {
                        deferred.resolve();
                    }

                }, function (err) {
                    if (err.toString().indexOf("ER_DUP_ENTRY") > -1) {
                        if (err.toString().indexOf("key 'phone'") > -1) {
                            deferred.reject("Phone number already exists");
                        }
                        else if (err.toString().indexOf("key 'email'") > -1) {
                            deferred.reject("Email already exists");
                        } else {
                            deferred.reject(err);
                        }
                    } else {
                        deferred.reject(err);
                    }
                });
            }
        });


        return deferred.promise;
    };

    Account.login = function (resp) {
        var deferred = Modules.Q.defer();
        var email = resp.email;
        var password = resp.password;

        if (email && password) {
            Modules.Database.query({query: 'SELECT * FROM users WHERE email = "' + email + '"'}).then(function (rows) {
                if (rows[0] && rows[0].email && rows[0].email.toLowerCase() == email.toLowerCase() && (Modules.Helper.encryptStr(password) == rows[0].password)) {
                    if (rows[0].valid) {
                        delete rows[0].password;
                        deferred.resolve({msg: "Login success", user: rows[0]});
                    } else {
                        deferred.reject("Please validate this email first");
                    }
                } else {
                    deferred.reject("Login failed");
                }
            });

        } else {
            deferred.reject("Login failed: Please enter user and password.");
        }
        return deferred.promise;
    };

    Account.verifyUserAccess = function (resp) {
        var deferred = Modules.Q.defer();
        var username = resp.username;
        if (username) {
            Modules.Database.query({query: 'SELECT level FROM users WHERE email = "' + username + '"'}).then(function (rows) {
                deferred.resolve(rows[0].level);
            });
        } else {
            deferred.reject("Level verification failed");
        }
        return deferred.promise;
    };

    Account.changePassword = function (parsedResponse) {
        var deferred = Modules.Q.defer();
        parsedResponse.password = Modules.Helper.encryptStr(parsedResponse.password);
        Modules.Database.query({query: 'UPDATE users SET password = "' + parsedResponse.password + '" WHERE email = "' + parsedResponse.email + '"'}).then(function (rows) {
            deferred.resolve();
        });
        return deferred.promise;
    };

    Account.validateCodes = function (parsedResponse) {
        var deferred = Modules.Q.defer();
        Modules.Database.query({query: 'SELECT * FROM codes WHERE name = "' + parsedResponse.name + '"'}).then(function (rows) {
            if (rows && rows.length > 0) {
                if (Modules.Helper.decryptStr(rows[0].value) == parsedResponse.code) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            } else {
                deferred.reject();
            }
        });
        return deferred.promise;
    };

    Account.emailConfirmation = function (parsedResponse) {
        var deferred = Modules.Q.defer();
        var userId = Modules.Helper.decryptStr(parsedResponse.userId);
        var code = Modules.Helper.decryptStr(parsedResponse.code);
        Modules.Database.query({query: 'SELECT verification_code FROM users WHERE id = "' + userId + '"'}).then(function (rows) {
            if (rows && rows[0].verification_code == code) {
                // update user
                update({
                    table: 'users',
                    id: userId,
                    'set': 'valid = "1"'
                }).then(function () {
                    deferred.resolve('Success');
                }, function (err) {
                    deferred.reject(err);
                });
            } else {
                deferred.reject();
            }
        });
        return deferred.promise;
    };

    return Account;
};