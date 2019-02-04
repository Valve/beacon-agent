class Tracker {
  public readonly url: string
  public readonly timeout: number
  public readonly queryParams = {
    visitorId: "vid",
    eventType: "et",
    eventCategory: "ec",
    eventAction: "ea",
    eventData: "ed"
  }

  constructor(url: string, timeout: 5000) {
    if (!url) {
      throw "url argument is required"
    }
    this.url = url
    this.timeout = timeout
  }

  public send(visitorId: string, eventType: string, eventData = {}): Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => { reject("timeout") }, this.timeout)
      if (this.isBeaconSupported()) {
        let enqueued = this.sendWithBeacon(visitorId, eventType, eventData)
        enqueued ? resolve() : reject("User agent failed to enqueue beacon")
      } else {
        this.sendWithPixel(visitorId, eventType, eventData)
          .catch(e => reject(e))
          .then(() => resolve())
      }
      resolve()
    })
    return promise
  }

  private isBeaconSupported(): boolean {
    return "sendBeacon" in navigator
  }

  private sendWithPixel(visitorId: string, eventType: string, eventData: {}): Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      const img = new Image(1, 1)
      img.onload = (e) => resolve()
      img.onerror = (e) => reject(e)
      let queryString = this.buildPixelQueryString(visitorId, eventType, eventData)
      img.src = "?" + queryString
    })
    return promise
  }

  private sendWithBeacon(visitorId: string, eventType: string, eventData: {}): boolean {
    const payload = this.buildBeaconPayload(visitorId, eventType, eventData)
    return navigator.sendBeacon(this.url, JSON.stringify(payload));
  }

  private buildBeaconPayload(visitorId: string, eventType: string, eventData: {}): {} {
    const payload = {}
    payload[this.queryParams.visitorId] = visitorId
    payload[this.queryParams.eventType] = eventType
    payload[this.queryParams.eventData] = this.acronymizeObject(eventData)
    return payload
  }

  private buildPixelQueryString(visitorId: string, eventType: string, eventData: {}): string {
    let params = {}
    params[this.queryParams.visitorId] = visitorId
    params[this.queryParams.eventType] = eventType
    params[this.queryParams.eventData] = this.valueToQueryString(eventData)
    return this.valueToQueryString(params)
  }

  private acronymizeObject(obj: {}): {} {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      newObj[this.maybeShortenKey(key)] = obj[key];
    })
    return newObj
  }

  private valueToQueryString(value: any): string {
    let encodeShortenedKey = (key) => encodeURIComponent(this.maybeShortenKey(key))
    let createKeyValuePair = (key) => `${encodeShortenedKey(key)}=${this.valueToQueryString(value[key])}`

    if (typeof value === "object") {
      return Object.keys(value).map(key => createKeyValuePair(key)).join("&")
    } else {
      return encodeURIComponent(value)
    }
  }

  private maybeShortenKey(key: string): string {
    return this.queryParams[key] || key;
  }
}
