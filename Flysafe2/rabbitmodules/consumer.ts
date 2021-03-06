import { resolve } from 'url';

export class Consumer {
  private channel: any;
  private connected: boolean;
  private connection: any;
  private queue: string;
  constructor(connection: any, queue: string) {
    this.connection = connection;
    this.queue = queue;
  }

  bail(err) {
    console.error(err);
    process.exit(1);
  }

  connect(): Promise<string> {
    const self = this;
    const promise = new Promise<string>((resolve, reject) => {
    const ok = self.connection.createChannel(on_open);
    function on_open(err, ch) {
      self.channel = ch;
      if (err != null) { self.bail(err); reject(err); }
      ch.assertQueue(self.queue);
      resolve('connected');
    }
    });
    return promise;
  }

  consume(callback) {
    const self = this;
    this.channel.consume(this.queue, function(msg) {
      console.log('message consumed');
      if (msg !== null) {
        self.channel.ack(msg);
        callback(self.queue, msg);
      } else {
        callback(self.queue, null);
      }
    });
  }
}

