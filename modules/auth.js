module.exports = function (Config, Modules) {

    this.login = function (params) {
        var deferred = Modules.Q.defer();
        Modules.pool.getConnection(function (err, connection) {
            if (err) {
                deferred.reject(err);
            } else {
                connection.query('SELECT id, email, password, phone, valid FROM Users WHERE email = ?', [params.email], function (err, rows) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        if (rows[0] && rows[0].email.toLowerCase() == params.email.toLowerCase() && (Modules.Helper.encryptStr(params.password) == rows[0].password)) {
                            if (rows[0].valid) {
                                delete rows[0].password;
                                deferred.resolve({msg: "Login success", user: rows[0]});
                            } else {
                                deferred.reject("Please validate this email first");
                            }
                        } else {
                            deferred.reject("Login failed");
                        }
                    }
                });
                // And done with the connection.
                connection.release();
            }
        });
        return deferred.promise;
    };

    return this;
};