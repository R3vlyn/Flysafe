"use strict";
exports.__esModule = true;
var Producer = /** @class */ (function () {
    function Producer(connection, queue) {
        this.connection = connection;
        this.queue = queue;
    }
    Producer.prototype.connect = function () {
        var self = this;
        var promise = new Promise(function (resolve, reject) {
            var ok = self.connection.createChannel(on_open);
            function on_open(err, ch) {
                self.channel = ch;
                if (err != null) {
                    self.bail(err);
                    reject(err);
                }
                ch.assertQueue(self.queue);
                resolve('connected');
            }
        });
        return promise;
    };
    Producer.prototype.bail = function (err) {
        console.error(err);
        process.exit(1);
    };
    Producer.prototype.publish = function (message) {
        this.channel.sendToQueue(this.queue, new Buffer(message));
    };
    return Producer;
}());
exports.Producer = Producer;
