export class Producer {
  private channel: any;
  private connected: boolean;
private connection: any;
public queue: string;
  constructor(connection: any, queue: string) {
    this.connection = connection;
    this.queue = queue;
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

  bail(err) {
    console.error(err);
    process.exit(1);
  }

  publish(message) {
    this.channel.sendToQueue(this.queue, new Buffer(message));
  }
}

