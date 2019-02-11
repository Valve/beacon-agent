class Tracker {
  private readonly VISITOR_KEY = "vid";
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

  constructor(endpointUrl: string, timeout = 5000) {
    if (!endpointUrl) {
      throw "endpointUrl argument is required"
    }
    this.endpointUrl = endpointUrl
    this.timeout = timeout
  }

  public send(eventData: {}): Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      let timeout = setTimeout(() => { reject("timeout") }, this.timeout)
      let clearTimeoutAndResolve = () => {
        clearTimeout(timeout)
        resolve()
      }

      if (this.isBeaconSupported()) {
        try {
          let sent = this.sendWithBeacon(eventData)
          if(sent) {
            clearTimeoutAndResolve()
          } else {
            reject("send failed")
          }
        } catch(e) {
          reject(`send failed: ${e}`)
        }
      } else {
        this.sendWithPixel(eventData).catch(e => reject(e)).then(() => resolve())
      }
    })
    return promise
  }

  private isBeaconSupported(): boolean {
    return "sendBeacon" in navigator
  }

  private sendWithPixel(eventData: {}): Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      const img = new Image(1, 1)
      img.onload = (e) => resolve()
      img.onerror = (e) => reject(e)
      let queryString = this.buildPixelQueryString(eventData)
      img.src = "?" + queryString
    })
    return promise
  }

  private sendWithBeacon(eventData: {}): boolean {
    const payload = this.buildBeaconPayload(eventData)
    return navigator.sendBeacon(this.endpointUrl, JSON.stringify(payload));
  }

  private buildBeaconPayload(eventData: {}): {} {
    const payload = {}
    payload[this.queryParams.visitorId] = this.getVisitorId() 
    payload[this.queryParams.eventData] = this.acronymizeObject(eventData)
    // adding additional values
    if(document.referrer !== "") {
      payload[this.queryParams.eventData][this.queryParams.referrer] = document.referrer
    }
    payload[this.queryParams.eventData][this.queryParams.url] = location.href
    return payload
  }

  private buildPixelQueryString(eventData: {}): string {
    const params = { visitorId: this.getVisitorId() }
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

  private getVisitorId(): string {
    let visitorId = localStorage.getItem(this.VISITOR_KEY)
    if(!visitorId) {
      visitorId = this.randomString(8)
      localStorage.setItem(this.VISITOR_KEY, visitorId)
    }
    return visitorId
  }

  private randomString(length: number): string {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
    let out = ""
    for(let i = 0; i < length; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return out
  }
}
