module.exports = function (Config, Modules) {

    var self = this;

    self.Pools = {};

    self.Pools.Cloud = Modules.Mysql.createPool(Config.Database.Cloud);

    self.query = function (params, bool) {
        var deferred = Modules.Q.defer();
        var db = (params.database ? self.Pools[params.database] : self.Pools.Cloud);
        db.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            connection.query(params.query, (params.obj ? params.obj : {}), function (err, results) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(results);
                }
                connection.release();
            });
        });
        return deferred.promise;
    };


    self.insert = function (params, bool) {
        var deferred = Modules.Q.defer();
        var db = (params.database ? self.Pools[params.database] : self.Pools.Cloud);
        db.getConnection(function (err, connection) {
            if (err) {
                deferred.reject(err);
            } else {
                connection.query('INSERT INTO ?? SET ?', [params.table, params.obj], function (err, result) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(result.insertId);
                    }
                });
                // And done with the connection.
                connection.release();
            }
        });
        return deferred.promise;
    };

    self.delete = function (params) {
        var deferred = Modules.Q.defer();
        var db = (params.database ? self.Pools[params.database] : self.Pools.Cloud);
        db.getConnection(function (err, connection) {
            if (err) {
                deferred.reject(err);
            } else {
                var query = 'DELETE FROM ?? WHERE id = ?';
                connection.query(query, [params.table, params.id], function (err, rows) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve();
                    }
                });
                // And done with the connection.
                connection.release();
            }
        });
        return deferred.promise;
    };

    self.update = function (params) {
        var deferred = Modules.Q.defer();
        var db = (params.database ? self.Pools[params.database] : self.Pools.Cloud);
        db.getConnection(function (err, connection) {
            if (err) {
                deferred.reject(err);
            } else {
                if (params.jsonToStringify) {
                    var dbQuery = 'UPDATE ' + params.table + ' SET ' + params.field + ' = ? WHERE ' + ((params.where) ? (params.whereField + ' = "' + params.whereValue + '"') : 'id = ?');
                    connection.query(dbQuery, [JSON.stringify(params.jsonToStringify), params.id], function (err, rows) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve();
                        }
                    });
                    connection.release();
                } else if (params.setAll) {
                    connection.query('UPDATE ?? SET ? WHERE id = ?', [params.table, params.setAll, params.id], function (err, rows) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve();
                        }
                    });
                    connection.release();
                } else if (params.whereParam) {
                    connection.query('UPDATE ?? SET ? WHERE ??', [params.table, params.setAllObj, params.whereParam], function (err, rows) {
                        if (err) { // missing something else to save
                            deferred.reject(err);
                        } else {
                            deferred.resolve();
                        }
                    });
                    connection.release();
                } else if (params.setAllObj) {
                    if (!params.key) {
                        connection.query('UPDATE ?? SET ? WHERE id = ?', [params.table, params.setAllObj, params.id], function (err, rows) {
                            if (err) {
                                deferred.reject(err);
                            } else {
                                deferred.resolve();
                            }
                        });
                    } else {
                        connection.query('UPDATE ?? SET ? WHERE ?? = ?', [params.table, params.setAllObj, params.key, params.value], function (err, rows) {
                            if (err) {
                                deferred.reject(err);
                            } else {
                                deferred.resolve();
                            }
                        });
                    }
                    connection.release();
                } else if (params.columnIsJson) {
                    // get json object first
                    Modules.Database.query({query: 'SELECT ' + parsedResponse.field + ' FROM ' + parsedResponse.table + ' WHERE id = "' + params.id + '"'}).then(function (rows) {
                        if (rows && rows.length == 1) {
                            var jsonObject = JSON.parse(rows[0][parsedResponse.field]);
                            // find correct entry in array
                            var itemIndex;
                            for (var i in jsonObject) {
                                if (jsonObject[i].id == parsedResponse.referenceId) {
                                    itemIndex = i;
                                }
                            }
                            if (!itemIndex) {
                                deferred.reject('Could not find correct entry to update in array');
                            } else {
                                // update value
                                jsonObject[itemIndex][parsedResponse.jsonProperty] = parsedResponse.jsonValue;
                                // restringify
                                var stringified = JSON.stringify(jsonObject);
                                // update
                                var updateObj = {
                                    table: params.table,
                                    id: params.id,
                                };
                                updateObj[params.field] = stringified;
                                Modules.Database.update(updateObj).then(function () {
                                    deferred.resolve();
                                }, function (err) {
                                    deferred.reject(err);
                                });
                            }

                        } else {
                            deferred.reject('Could not find correct match');
                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                } else {
                    console.log('updating', params);
                    connection.query('UPDATE ?? SET ?? WHERE id = ??', [params.table, params.setStr, params.id], function (err, rows) {
                        if (err) { // missing something else to save
                            deferred.reject(err);
                        } else {
                            deferred.resolve();
                        }
                    });
                    connection.release();
                }
            }
        });
        return deferred.promise;
    };

    self.upload = function (data) {
        var deferred = Modules.Q.defer();
        var file = data.file;
        console.log('Received file', file);
        var path = file.path;
        var name = file.name;
        var size = file.size;
        var type = file.type;
        var fileExtension = file.type.split('/')[1];

        Modules.fs.readFile(path, function (err, data) {
            var uploadPath = 'public/uploads/' + Modules.moment().unix() + '_' + name;
            fs.writeFile(uploadPath, data, function (err) {
                if (err) {
                    console.log('Upload failed:', err);
                    deferred.reject("Upload failed");
                } else {
                    console.log('Upload success', uploadPath);
                    deferred.resolve(uploadPath);
                }
            });
        });

        return deferred.promise;
    };


    return self;
};