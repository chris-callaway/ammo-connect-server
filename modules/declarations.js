module.exports = function (Config) {
    this.Mysql = require('mysql');
    this.Moment = require('moment');
    this.Q = require('q');
    this.request = require('request').defaults({jar: true});
    this.Promise = require('bluebird');
    this.evnLogger = require('morgan');
    this.methodOverride = require('method-override');
    this.session = require('express-session');
    this.webSocketServer = require('websocket').server;
    this.bodyParser = require('body-parser');
    this.port = process.env.PORT || 7010; // set our port
    this.fs = require('fs-extra');
    this.util = require('util');
    this.moment = require('moment');
    this.multipart = require('connect-multiparty');
    this.multipartMiddleware = this.multipart();
    this.cookieJar = this.request.jar();
    this.CronJob = require('cron').CronJob;
    this.jquery = require('jquery');
    this.jsdom = require('jsdom');
    this.http = require('http');
    this.https = require('https');
    this.http.globalAgent.maxSockets = Infinity;
    this.https.globalAgent.maxSockets = Infinity;
    this.cookieJar = this.request.jar();
    this.crypto = require('crypto');
    this.algorithm = 'aes-256-ctr';
    this.cryptoPassword = 'd6F3Efeq';
    this.Spherical = require('spherical-geometry-js');
    this.twilio = require('twilio');
    this.twilioClient = new this.twilio(Config.Twilio.AccountSID, Config.Twilio.AuthToken);
    this.winston = require('winston');
    this.winstonExposed = require('winston-papertrail').Papertrail;
    this.winstonApi = require('./winston')(Config, this);
    this.DeathByCaptcha = require("deathbycaptcha");
    this.dbc = new this.DeathByCaptcha("ccallaway88", "Eastbrook1");
    this.Helper = require('./helper')(Config, this);
    this.xlsx = require('node-xlsx');
    this.Database = require('./database')(Config, this);
    this.Account = require('./account')(Config, this);
    this.Auth = require('./auth')(Config, this);
    this.CronJobManager = require('./cronjobs')(Config, this);
    this.ScraperBuilder = require('./scraper')(Config, this);
    this.ScraperAssistant = require('./scraper-assistant')(Config, this);
    this.Scrapers = {};
    this.Bullhorn = {};

    this.Notifications = {};
    this.Notifications.Main = require('./../notifications/notifications')(Config, this);
    this.Notifications.Helper = require('./../notifications/helper')(Config, this);
    this.WebSocket = require('./websocket')(Config, this);
    this.Scrapers.Carolinamunitions = require('./../scrapers/sites/carolinamunitions')(Config, this);
    this.ScraperDeployments = require('./../scrapers/deployments')(Config, this);

    this.Tasks = {};
    this.TwilioApi = require('./twilio-api')(Config, this);
    this.apn = require('apn');
    this.apnProvider = new this.apn.Provider({
    token: { 
        key: "/home/developer/public_html/ammoconnect/server/modules/AuthKey_LYL5MP9265.p8",
        keyId: "LYL5MP9265",
        teamId: "FVD8SMFC87"
    },
    production: false
});
    return this;
};
