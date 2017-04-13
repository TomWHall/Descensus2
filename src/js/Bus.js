"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const topics = {};
function subscribe(topic, subscriber) {
    if (!topics[topic]) {
        topics[topic] = [];
    }
    if (topics[topic].indexOf(subscriber) === -1) {
        topics[topic].push(subscriber);
    }
}
function unsubscribe(topic, subscriber) {
    if (!topics[topic])
        return;
    var index = topics[topic].indexOf(subscriber);
    if (index !== -1) {
        topics[topic].splice(index, 1);
    }
}
function publish(topic, data) {
    var subscribers = topics[topic];
    if (subscribers) {
        for (var i = 0; i < subscribers.length; i++) {
            var subscriber = subscribers[i];
            subscriber(data);
        }
    }
}
exports.default = { subscribe, unsubscribe, publish };
