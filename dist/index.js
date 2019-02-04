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
                var enqueued = _this.sendWithBeacon(visitorId, eventType, eventData);
                enqueued ? resolve() : reject("User agent failed to enqueue beacon");
            }
            else {
                _this.sendWithPixel(visitorId, eventType, eventData)
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
    Tracker.prototype.sendWithPixel = function (visitorId, eventType, eventData) {
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
    Tracker.prototype.sendWithBeacon = function (visitorId, eventType, eventData) {
        var payload = this.buildBeaconPayload(visitorId, eventType, eventData);
        return navigator.sendBeacon(this.url, JSON.stringify(payload));
    };
    Tracker.prototype.buildBeaconPayload = function (visitorId, eventType, eventData) {
        var payload = {};
        payload[this.queryParams.visitorId] = visitorId;
        payload[this.queryParams.eventType] = eventType;
        payload[this.queryParams.eventData] = this.acronymizeObject(eventData);
        return payload;
    };
    Tracker.prototype.buildPixelQueryString = function (visitorId, eventType, eventData) {
        var params = {};
        params[this.queryParams.visitorId] = visitorId;
        params[this.queryParams.eventType] = eventType;
        params[this.queryParams.eventData] = this.valueToQueryString(eventData);
        return this.valueToQueryString(params);
    };
    Tracker.prototype.acronymizeObject = function (obj) {
        var _this = this;
        var newObj = {};
        Object.keys(obj).forEach(function (key) {
            newObj[_this.maybeShortenKey(key)] = obj[key];
        });
        return newObj;
    };
    Tracker.prototype.valueToQueryString = function (value) {
        var _this = this;
        var encodeShortenedKey = function (key) { return encodeURIComponent(_this.maybeShortenKey(key)); };
        var createKeyValuePair = function (key) { return encodeShortenedKey(key) + "=" + _this.valueToQueryString(value[key]); };
        if (typeof value === "object") {
            return Object.keys(value).map(function (key) { return createKeyValuePair(key); }).join("&");
        }
        else {
            return encodeURIComponent(value);
        }
    };
    Tracker.prototype.maybeShortenKey = function (key) {
        return this.queryParams[key] || key;
    };
    return Tracker;
}());
//# sourceMappingURL=index.js.map