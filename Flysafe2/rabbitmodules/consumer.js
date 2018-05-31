"use strict";
exports.__esModule = true;
var Consumer = /** @class */ (function () {
    function Consumer(connection, queue) {
        this.connection = connection;
        this.queue = queue;
    }
    Consumer.prototype.bail = function (err) {
        console.error(err);
        process.exit(1);
    };
    Consumer.prototype.connect = function () {
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
    Consumer.prototype.consume = function (callback) {
        var self = this;
        this.channel.consume(this.queue, function (msg) {
            console.log('message consumed');
            if (msg !== null) {
                self.channel.ack(msg);
                callback(self.queue, msg);
            }
            else {
                callback(self.queue, null);
            }
        });
    };
    return Consumer;
}());
exports.Consumer = Consumer;
