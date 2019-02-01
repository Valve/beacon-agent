var Tracker = /** @class */ (function () {
    function Tracker(url, timeout) {
        this.queryParams = {
            visitorId: "vid",
            eventType: "et",
            eventCategory: "ec",
            eventAction: "ea",
            eventData: "ed"
        };
        if (!url) {
            throw "url argument is required";
        }
        this.url = url;
        this.timeout = timeout;
    }
    Tracker.prototype.send = function (visitorId, eventType, eventData) {
        var _this = this;
        if (eventData === void 0) { eventData = {}; }
        var promise = new Promise(function (resolve, reject) {
            setTimeout(function () { reject("timeout"); }, _this.timeout);
            if (_this.isBeaconSupported()) {
                var enqueued = _this.trackWithBeacon(visitorId, eventType, eventData);
                enqueued ? resolve() : reject("User agent failed to enqueue beacon");
            }
            else {
                _this.trackWithPixel(visitorId, eventType, eventData)
                    .catch(function (e) { return reject(e); })
                    .then(function () { return resolve(); });
            }
            resolve();
        });
        return promise;
    };
    Tracker.prototype.isBeaconSupported = function () {
        return "sendBeacon" in navigator;
    };
    Tracker.prototype.trackWithPixel = function (visitorId, eventType, eventData) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var img = new Image(1, 1);
            img.onload = function (e) { return resolve(); };
            img.onerror = function (e) { return reject(e); };
            var queryString = _this.buildPixelQueryString(visitorId, eventType, eventData);
            img.src = "?" + queryString;
        });
        return promise;
    };
    Tracker.prototype.trackWithBeacon = function (visitorId, eventType, eventData) {
        var payload = this.buildBeaconPayload(visitorId, eventType, eventData);
        return navigator.sendBeacon(this.url, payload);
    };
    Tracker.prototype.buildBeaconPayload = function (visitorId, eventType, eventData) {
        var payload = new FormData();
        payload.set(this.queryParams.visitorId, visitorId);
        payload.set(this.queryParams.eventType, eventType);
        payload.set(this.queryParams.eventData, this.valueToQueryString(eventData));
        return payload;
    };
    Tracker.prototype.buildPixelQueryString = function (visitorId, eventType, eventData) {
        var params = {};
        params[this.queryParams.visitorId] = visitorId;
        params[this.queryParams.eventType] = eventType;
        params[this.queryParams.eventData] = this.valueToQueryString(eventData);
        return this.valueToQueryString(params);
    };
    Tracker.prototype.valueToQueryString = function (value) {
        var _this = this;
        if (typeof value === "string") {
            return encodeURIComponent(value);
        }
        else if (typeof value === "object") {
            return Object.keys(value).map(function (k) {
                encodeURIComponent(k) + "=" + _this.valueToQueryString(value[k]);
            }).join("&");
        }
    };
    return Tracker;
}());
//# sourceMappingURL=index.js.map