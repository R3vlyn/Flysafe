var amqp = require('amqplib/callback_api');

var connection;
var url = 'localhost';
var notificationexchange = 'notification';
var notificationroutingkey = 'notification.*.*';
var conclusionexchange = 'conclusion';
var conclusionroutingkey = 'conclusion.storm.critical';
var receivedmessages = [];
var notificationchannel;
var conclusionchannel;
var sentconclusions = [];

amqp.connect('amqp://' + url, function(err, connection) {
    connection.createChannel(function(err, ch) {
        ch.assertExchange(notificationexchange, 'topic', { durable: false });
        ch.assertQueue('', { exclusive: true }, function(err, q) {
            ch.bindQueue(q.queue, notificationexchange, notificationroutingkey);
            ch.consume(q.queue, function(msg) {
                var parsedmessage = JSON.parse(msg.content)
                receivedmessages.push(parsedmessage);
                HandleData(parsedmessage);
            }, { noAck: true });
        });
    });
    connection.createChannel(function(err, ch) {
        ch.assertExchange(conclusionexchange, 'topic', { durable: false });
        conclusionchannel = ch;
    });
});

function HandleData(msg) {
    console.log(`${receivedmessages.length} data pieces collected, the last message was :${msg.message} by ${msg.plane} `);
    if (receivedmessages.length > 5) {
        ExecuteAlgorithm();
    }
}

function SendConclusion(message) {
    var sentmsg = sentconclusions.filter((element) => { return element.message === message.message })[0];
    if (sentmsg !== null) {
        console.log(sentmsg.message + 'was already sent');
    }

    if (sentmsg === undefined || sentmsg === null) {
        conclusionchannel.publish(conclusionexchange, conclusionroutingkey, new Buffer(JSON.stringify(message)));
        sentconclusions.push(message);
        console.log(sentmsg.message + 'has been sent sent');
    }

}

function ExecuteAlgorithm() {
    console.log('executing algorithm');
    receivedmessages.forEach((message) => {
        console.log(`Looping through message: ${message.message}`);
        message.nearbymessages = [];
        receivedmessages.forEach((othermessage) => {
            if (message.id !== othermessage.id) {
                console.log('Checking if nearby');
                if (othermessage.lat < message.lat + 1 && othermessage.lat > message.lat - 1 && othermessage.lng < message.lng + 1 && othermessage.lng > message.lng - 1) {
                    message.nearbymessages.push(othermessage);
                    console.log('is nearby!');
                }
            }
        })
        if (message.nearbymessages.length >= 5) {
            console.log('more than 5 messages are nearby!');
            var message = { message: `WATCH OUT FOR STORM NEAR ${message.lat} and ${message.lng}` }
            SendConclusion(message);
        }
    })
}