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
    if(!url) {
      throw "url argument is required"
    }
    this.url = url
    this.timeout = timeout
  }

  public send(visitorId: string, eventType: string, eventData = {})
    : Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => { reject("timeout") }, this.timeout)
      if (this.isBeaconSupported()) {
        let enqueued = this.trackWithBeacon(visitorId, eventType, eventData)
        enqueued ? resolve() : reject("User agent failed to enqueue beacon")
      } else {
        this.trackWithPixel(visitorId, eventType, eventData)
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

  private trackWithPixel(visitorId: string, eventType: string, eventData: {})
    : Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      const img = new Image(1, 1)
      img.onload = (e) => resolve()
      img.onerror = (e) => reject(e)
      let queryString = this.buildPixelQueryString(visitorId, eventType, eventData)
      img.src = "?" + queryString
    })
    return promise
  }

  private trackWithBeacon(visitorId: string, eventType: string, eventData: {})
    : boolean {
    const payload = this.buildBeaconPayload(visitorId, eventType, eventData)
    return navigator.sendBeacon(this.url, payload)
  }

  private buildBeaconPayload(visitorId: string, eventType: string, eventData: {})
    : FormData {
    let payload = new FormData()
    payload.set(this.queryParams.visitorId, visitorId)
    payload.set(this.queryParams.eventType, eventType)
    payload.set(this.queryParams.eventData, this.valueToQueryString(eventData))
    return payload
  }

  private buildPixelQueryString(visitorId: string, eventType: string, eventData: {})
    : string {
    let params = {}
    params[this.queryParams.visitorId] = visitorId
    params[this.queryParams.eventType] = eventType
    params[this.queryParams.eventData] = this.valueToQueryString(eventData)
    return this.valueToQueryString(params)
  }

  private valueToQueryString(value: string | {}): string {
    if (typeof value === "string") {
      return encodeURIComponent(value)
    } else if (typeof value === "object") {
      return Object.keys(value).map(k => {
        `${encodeURIComponent(k)}=${this.valueToQueryString(value[k])}`
      }).join("&")
    }
  }
}
