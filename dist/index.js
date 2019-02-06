var Tracker = /** @class */ (function () {
    function Tracker(endpointUrl, timeout) {
        this.queryParams = {
            visitorId: "vid",
            eventType: "et",
            eventCategory: "ec",
            eventAction: "ea",
            eventData: "ed",
            referrer: "r",
            url: "url"
        };
        if (!endpointUrl) {
            throw "endpointUrl argument is required";
        }
        this.endpointUrl = endpointUrl;
        this.timeout = timeout;
    }
    Tracker.prototype.send = function (visitorId, eventData) {
        var _this = this;
        if (eventData === void 0) { eventData = {}; }
        var promise = new Promise(function (resolve, reject) {
            setTimeout(function () { reject("timeout"); }, _this.timeout);
            if (_this.isBeaconSupported()) {
                var enqueued = _this.sendWithBeacon(visitorId, eventData);
                enqueued ? resolve() : reject("Failed to enqueue beacon");
            }
            else {
                _this.sendWithPixel(visitorId, eventData).catch(function (e) { return reject(e); }).then(function () { return resolve(); });
            }
            resolve();
        });
        return promise;
    };
    Tracker.prototype.isBeaconSupported = function () {
        return "sendBeacon" in navigator;
    };
    Tracker.prototype.sendWithPixel = function (visitorId, eventData) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var img = new Image(1, 1);
            img.onload = function (e) { return resolve(); };
            img.onerror = function (e) { return reject(e); };
            var queryString = _this.buildPixelQueryString(visitorId, eventData);
            img.src = "?" + queryString;
        });
        return promise;
    };
    Tracker.prototype.sendWithBeacon = function (visitorId, eventData) {
        var payload = this.buildBeaconPayload(visitorId, eventData);
        return navigator.sendBeacon(this.endpointUrl, JSON.stringify(payload));
    };
    Tracker.prototype.buildBeaconPayload = function (visitorId, eventData) {
        var payload = {};
        payload[this.queryParams.visitorId] = visitorId;
        payload[this.queryParams.eventData] = this.acronymizeObject(eventData);
        // adding additional values
        if (document.referrer !== "") {
            payload[this.queryParams.eventData][this.queryParams.referrer] = document.referrer;
        }
        payload[this.queryParams.eventData][this.queryParams.url] = location.href;
        return payload;
    };
    Tracker.prototype.buildPixelQueryString = function (visitorId, eventData) {
        var params = {};
        params[this.queryParams.visitorId] = visitorId;
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