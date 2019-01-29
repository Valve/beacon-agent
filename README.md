# Event-Tracker (WIP)

Simple library that allows you to send events to your server. Useful to send analytics and diagnostics events.

Uses (Beacon API)[https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API] if it's available 
and an image node if it's not.

## Usage

```js
var tracker = new Tracker('/endpoint');
tracker.track(eventType: 'event', eventCategory: 'ad', eventAction: 'click', 
  eventData: {adID: '233925', adPosition: 'top-left'}
);
```

Track returns a promise so you can chain it with other async methods:

```js
tracker.track(...).then(console.log("sent analytics event successfully"));
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
### Licence

This code is [MIT][mit] licenced:

Copyright (c) 2018 Valentin Vasilyev

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[mit]: http://www.opensource.org/licenses/mit-license.php
