module.exports = function (Config, Modules) {

    var WebSocket = {};
    var webSocketsServerPort = 3335;
    WebSocket.history = [];
    WebSocket.clients = [];

    WebSocket.init = function () {
        /**
         * HTTP server
         */
        var server = http.createServer(function (request, response) {
            // Not important for us. We're writing WebSocket server, not HTTP server
        });
        server.listen(webSocketsServerPort, function () {
            console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
        });

        /**
         * WebSocket server
         */
        var wsServer = new Modules.webSocketServer({
            httpServer: server
        });

        wsServer.on('request', function (request) {
            var chatroom = request.chatId;

            var connection = request.accept(null, request.origin);
            // we need to know client index to remove them on 'close' event
            var index = WebSocket.clients.push(connection) - 1;

            console.log((new Date()) + ' Connection accepted.');

            // send back chat history
            if (WebSocket.history.length > 0) {
                connection.sendUTF(JSON.stringify({type: 'history', data: WebSocket.history}));
            }

            // user sent some message
            connection.on('message', function (resp) {
                var json = JSON.parse(resp.utf8Data);
                switch (json[0].type) {
                    case 'chatMessage':
                        // broadcast message to all connected clients
                        var message = JSON.stringify({type: json[0].type, data: json});
                        for (var i = 0; i < WebSocket.clients.length; i++) {
                            WebSocket.clients[i].sendUTF(message);
                        }
                        console.log('sent message', message);
                        var notification = {type: 'notification', data: json};
                        // save notification for end user
                        WebSocket.saveChatNotification(notification, WebSocket.clients);
                        break;
                    case 'updateOnlineStatus':
                        // broadcast message to all connected clients
                        var sendout = JSON.stringify({
                            type: json[0].type,
                            data: {userId: json[0].userId, status: json[0].status}
                        });
                        for (var i = 0; i < WebSocket.clients.length; i++) {
                            WebSocket.clients[i].sendUTF(sendout);
                        }

                        // handle idle sessions or closed browsers
                        Modules.Database.update({
                            table: 'users',
                            setAll: {
                                online_status: json[0].status,
                                last_online: Modules.moment(json[0].date + ' ' + json[0].time).unix() * 1000
                            },
                            id: json[0].userId
                        });
                        break;
                        case 'webSocketMessage':
                            // broadcast message to all connected clients
                            var sendout = JSON.stringify({
                            method: json[0].type,
                            data: {
                                notificationId: 'reminder', // Sets notification ID. If exists it will clear previous notification.
                                type: 'basic', // 'basic', 'image', 'list', 'progress'
                                title: 'Title Text',
                                message: 'Message text goes here.'
                            }
                        });
                        for (var i = 0; i < WebSocket.clients.length; i++) {
                            WebSocket.clients[i].sendUTF(sendout);
                        }
                        break;
                }
            });

            // user disconnected
            connection.on('close', function (connection) {
                console.log((new Date()) + " Peer "
                    + connection.remoteAddress + " disconnected.");
                // remove user from the list of connected clients
                WebSocket.clients.splice(index, 1);
            });

        });
    };


    WebSocket.saveChatNotification = function (notification, clients) {
        for (var i = 0; i < WebSocket.clients.length; i++) {
            WebSocket.clients[i].sendUTF(JSON.stringify(notification));
        }

        Modules.Database.query({
            query: 'SELECT * FROM users where id = "' + notification.data[0].user_id + '"'
        }).then(function (user) {

            notification.data[0].firstname = user[0].firstname;
            notification.data[0].lastname = user[0].lastname;
            notification.data[0].profile_img = user[0].profile_img;
            notification.data[0].time_unix = Modules.moment().tz("America/New_York").unix();

            Modules.Database.insert({
                table: 'user_notifications', obj: {
                    user_id: notification.data[0].partner_id,
                    firstname: user[0].firstname,
                    lastname: user[0].lastname,
                    profile_img: user[0].profile_img ? user[0].profile_img : 'http://nicesnippets.com/demo/man01.png',
                    from_id: notification.data[0].sender_id,
                    message: notification.data[0].message,
                    date: Modules.moment().format('MM/DD/YYYY'),
                    time_unix: Modules.moment().tz("America/New_York").unix()
                }
            });
        });
    };

    WebSocket.LogOffInactiveUsers = function () {
        var deferred = Modules.Q.defer();
        var time = Modules.moment(new Date()).subtract(10, 'minutes').unix() * 1000;
        Modules.Database.query({query: 'SELECT * FROM users WHERE last_online IS NULL OR last_online < "' + time + '"'}).then(function (users) {
            for (var i in users) {
                Modules.Database.update({
                    table: 'users',
                    setAll: {online_status: 'Offline'},
                    id: users[i].id
                }).then(function () {
                    if (i == users.length - 1) {
                        deferred.resolve();
                    }
                });
            }
        });
        return deferred.promise;
    };

    return WebSocket;
}