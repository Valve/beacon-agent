# Event-Tracker (WIP)

Simple library that allows you to send events to your server. Useful to send analytics and diagnostics events.

Uses Beacon API if it's available and a proven 1x1 pixel if it's not.

## Usage

```js
var tracker = new Tracker('/endpoint');
tracker.track(eventType: 'event', eventCategory: 'ad', eventAction: 'click', 
  eventData: {adID: '233925', adPosition: 'top-left'}
);
```

Track returns a promise so you can chain it with other async methods:

```js
tracker.track(...).then(console.log("send analytics event successfully"));
```

You can also specify a timeout after which the promise will be rejected.
This is done to not keep open connections to busy servers forever.

```js
// reject after 5 seconds
var tracker = new Tracker('/endpoing', 5000); 
tracker.track(...);
```

Tracker will use these values for the params:

```
eventType: et
eventCategory: ec
eventAction: ea
eventData: ed
```

It's possible to override these by specifying a new object:

```js
Tracker.queryParams = {
  eventType: '___et___',
  ...
}
```