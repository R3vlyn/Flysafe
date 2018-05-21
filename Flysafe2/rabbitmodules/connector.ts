export class Connector {
  public connection: any;
  public connected: Boolean = false;
  constructor(private url: string) {
    const self = this;
    require('amqplib/callback_api').connect('amqp://' + url, function(err, connection) {
      self.connection = connection;
        if (err != null) { self.bail(err); } else {self.connected = true; }
    });
  }

  bail(err) {
    console.error(err);
    process.exit(1);
  }
}


