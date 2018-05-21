"use strict";
exports.__esModule = true;
var Connector = /** @class */ (function () {
    function Connector(url) {
        this.url = url;
        this.connected = false;
        var self = this;
        require('amqplib/callback_api').connect('amqp://' + url, function (err, connection) {
            self.connection = connection;
            if (err != null) {
                self.bail(err);
            }
            else {
                self.connected = true;
            }
        });
    }
    Connector.prototype.bail = function (err) {
        console.error(err);
        process.exit(1);
    };
    return Connector;
}());
exports.Connector = Connector;
