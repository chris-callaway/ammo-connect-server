var express = require('express');
var app = express();
var Config = require('./modules/config');
var Modules = require('./modules/declarations')(Config);

app.set('port', 8096);
app.use(Modules.evnLogger('dev'));
app.use(Modules.methodOverride());
app.use(Modules.session({resave: true, saveUninitialized: true, secret: 'uwotm8'}));
app.use(Modules.bodyParser.json());
app.use(Modules.bodyParser.urlencoded({extended: true}));

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

app.use(allowCrossDomain);

// start app ===============================================

app.listen(8096);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.get('/', Modules.multipartMiddleware, function (req, res) {
    try {
        var response = req.originalUrl.substring(req.originalUrl.indexOf("=") + 1);
        var split = response.split('&');
        var authCode = split[0];
        if (authCode != "access_denied" || authCode != "server_error") {
            res.send(authCode);
        } else {
            res.send('Error');
        }
    } catch (e) {
        res.json({success: false, err: 'error processing bh auth ' + e});
    }
});

function isEmpty(myObject) {
    for (var key in myObject) {
        if (myObject.hasOwnProperty(key)) {
            return false;
        }
    }

    return true;
}

app.post('/', Modules.multipartMiddleware, function (req, res) {
    var files = req.files;
    var parsedResponse;
    try {
        if (req.body.data) {
            parsedResponse = JSON.parse(req.body.data);
        } else {
            parsedResponse = req.body[0] ? req.body[0] : req.body;
        }
        parsedResponse.file = files;

        if (parsedResponse.file && !isEmpty(parsedResponse.file)) {
            console.log('has file');
            Modules.Database.upload(parsedResponse.file).then(function (resp) {
                if (typeof(resp) == 'number') {
                    resp = resp.toString();
                }
                res.send(resp);
            }, function (err) {
                res.status(500).send(err);
            });
        } else {
            console.log(parsedResponse);
            parseData(parsedResponse, req, res).then(function (resp) {
                if (typeof(resp) == 'number') {
                    resp = resp.toString();
                }
                res.send(resp);
            }, function (err) {
                res.status(500).send(err);
            });
        }

    } catch (e) {
        req.on('data', function (chunk) {
            var parsedResponse = JSON.parse(chunk)[0];
            parseData(parsedResponse, req, res).then(function (resp) {
                if (typeof(resp) == 'number') {
                    resp = resp.toString();
                }
                res.send(resp);
            }, function (err) {
                res.status(500).send(err);
            });
        });
    }
});

function parseData(data, req, res) {
    var deferred = Modules.Q.defer();
    if (!data.ChildModule) {
        Modules[data.Module][data.Method](data.params).then(function (resp) {
            deferred.resolve(resp);
        }, function (err) {
            deferred.reject(err);
        });
    } else {
        Modules[data.Module][data.ChildModule][data.Method](data.params).then(function (resp) {
            deferred.resolve(resp);
        }, function (err) {
            deferred.reject(err);
        });
    }
    return deferred.promise;
}

Modules.WebSocket.init();

console.log('Magic happens on port 8095');           // shoutout to the user
exports = module.exports = app;