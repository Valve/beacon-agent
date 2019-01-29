class Tracker {
  public readonly url: string
  public readonly timeout: number
  public readonly queryParams = {
    eventType: 'et',
    eventCategory: 'ec',
    eventAction: 'ea',
    eventData: 'ed'
  }

  constructor(url: string, timeout: 5000) {
    if(!url) {
      throw "url argument is required";
    }
    this.url = url
    this.timeout = timeout
  }

  public send(eventType: string, eventCategory: string, eventAction: string, eventData = {})
    : Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => { reject("timeout") }, this.timeout)
      if (this.isBeaconSupported()) {
        let enqueued = this.trackWithBeacon(eventType, eventCategory, eventAction, eventData)
        enqueued ? resolve() : reject("User agent failed to enqueue beacon")
      } else {
        this.trackWithPixel(eventType, eventCategory, eventAction, eventData)
          .catch(e => reject(e))
          .then(() => resolve())
      }
      resolve()
    });
    return promise
  }

  private isBeaconSupported(): boolean {
    return "sendBeacon" in navigator
  }

  private trackWithPixel(eventType: string, eventCategory: string, eventAction: string, eventData: {})
    : Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      const img = new Image(1, 1)
      img.onload = (e) => resolve()
      img.onerror = (e) => reject(e)
      let queryString = this.buildPixelQueryString(eventType, eventCategory, eventAction, eventData)
      img.src = "?" + queryString
    })
    return promise
  }

  private trackWithBeacon(eventType: string, eventCategory: string, eventAction: string, eventData: {})
    : boolean {
    const payload = this.buildBeaconPayload(eventType, eventCategory, eventAction, eventData)
    return navigator.sendBeacon(this.url, payload)
  }

  private buildBeaconPayload(eventType: string, eventCategory: string, eventAction: string, eventData: {})
    : FormData {
    let payload = new FormData()
    payload.set(this.queryParams.eventType, eventType)
    payload.set(this.queryParams.eventCategory, eventCategory)
    payload.set(this.queryParams.eventAction, eventAction)
    payload.set(this.queryParams.eventData, this.valueToQueryString(eventData))
    return payload
  }

  private buildPixelQueryString(eventType: string, eventCategory: string, eventAction: string, eventData: {})
    : string {
    let params = {}
    params[this.queryParams.eventType] = eventType
    params[this.queryParams.eventCategory] = eventCategory
    params[this.queryParams.eventAction] = eventAction
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
