module.exports = function (Config, Modules) {

    var Winston = {};

    Winston.consoleLogger = new Modules.winston.transports.Console({
        timestamp: function () {
            return new Date().toString();
        },
        colorize: true
    });

    Winston.fileLogger = new Modules.winston.transports.File({filename: './../crypto-out.log'});

    Winston.ptTransport = new Modules.winstonExposed({
        host: 'logs2.papertrailapp.com',
        port: 35595,
        colorize: true
    });

    Winston.logger = new Modules.winston.Logger({
        transports: [
            Winston.ptTransport,
            Winston.consoleLogger,
            Winston.fileLogger
        ]
    });

    Winston.init = function () {

        Winston.ptTransport.on('error', function (err) {
            Winston.logger && Winston.logger.error(err);
        });

        Winston.ptTransport.on('connect', function (message) {
            Winston.logger && Winston.logger.info(message);
        });

        // map native console methods to pass through papertrail

        console.log = function () {
            Winston.logger.info.apply(Winston.logger, Modules.Helper.formatArgs(arguments));
        };
        console.info = function () {
            Winston.logger.info.apply(Winston.logger, Modules.Helper.formatArgs(arguments));
        };
        console.warn = function () {
            Winston.logger.warn.apply(Winston.logger, Modules.Helper.formatArgs(arguments));
        };
        console.error = function () {
            Winston.logger.error.apply(Winston.logger, Modules.Helper.formatArgs(arguments));
        };
        console.debug = function () {
            Winston.logger.debug.apply(Winston.logger, Modules.Helper.formatArgs(arguments));
        };
    };

    return Winston;

};