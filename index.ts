class Tracker {
  public readonly endpointUrl: string
  public readonly timeout: number
  public readonly queryParams = {
    visitorId: "vid",
    eventType: "et",
    eventCategory: "ec",
    eventAction: "ea",
    eventData: "ed",
    referrer: "r",
    url: "url"
  }

  constructor(endpointUrl: string, timeout: 5000) {
    if (!endpointUrl) {
      throw "endpointUrl argument is required"
    }
    this.endpointUrl = endpointUrl
    this.timeout = timeout
  }

  public send(visitorId: string, eventData = {}): Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => { reject("timeout") }, this.timeout)
      if (this.isBeaconSupported()) {
        let enqueued = this.sendWithBeacon(visitorId, eventData)
        enqueued ? resolve() : reject("Failed to enqueue beacon")
      } else {
        this.sendWithPixel(visitorId, eventData).catch(e => reject(e)).then(() => resolve())
      }
      resolve()
    })
    return promise
  }

  private isBeaconSupported(): boolean {
    return "sendBeacon" in navigator
  }

  private sendWithPixel(visitorId: string, eventData: {}): Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      const img = new Image(1, 1)
      img.onload = (e) => resolve()
      img.onerror = (e) => reject(e)
      let queryString = this.buildPixelQueryString(visitorId, eventData)
      img.src = "?" + queryString
    })
    return promise
  }

  private sendWithBeacon(visitorId: string, eventData: {}): boolean {
    const payload = this.buildBeaconPayload(visitorId, eventData)
    return navigator.sendBeacon(this.endpointUrl, JSON.stringify(payload));
  }

  private buildBeaconPayload(visitorId: string, eventData: {}): {} {
    const payload = {}
    payload[this.queryParams.visitorId] = visitorId
    payload[this.queryParams.eventData] = this.acronymizeObject(eventData)
    // adding additional values
    if(document.referrer !== "") {
      payload[this.queryParams.eventData][this.queryParams.referrer] = document.referrer
    }
    payload[this.queryParams.eventData][this.queryParams.url] = location.href
    return payload
  }

  private buildPixelQueryString(visitorId: string, eventData: {}): string {
    let params = {}
    params[this.queryParams.visitorId] = visitorId
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
