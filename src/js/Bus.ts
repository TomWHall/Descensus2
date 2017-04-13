const topics: any = {};

function subscribe(topic: string, subscriber: (data: any) => void): void {
  if (!topics[topic]) {
    topics[topic] = [];
  }
  if (topics[topic].indexOf(subscriber) === - 1) {
    topics[topic].push(subscriber);
  }
}

function unsubscribe(topic: string, subscriber: (data: any) => void): void {
  if (!topics[topic]) return;

  var index = topics[topic].indexOf(subscriber);
  if (index !== - 1) {
    topics[topic].splice(index, 1);
  }
}

function publish(topic: string, data?: any): void {
  var subscribers = topics[topic];
  if (subscribers) {
    for (var i = 0; i < subscribers.length; i++) {
      var subscriber = subscribers[i];
      subscriber(data);
    }
  }
}

export default { subscribe, unsubscribe, publish };