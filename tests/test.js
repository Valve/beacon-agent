describe("Tracker", () => {
  const url = "https://example.com";
  describe("Constructor", () => {
    it("works", () => {
      let tracker = new Tracker("https://example.com");
      expect(tracker).not.toBeNull();
    });

    it("sets the tracking URL", () => {
      let tracker = new Tracker(url);
      expect(tracker.url).toEqual(url);
    });

    it("sets the timeout", () => {
      const url = "https://example.com";
      let tracker = new Tracker(url, 5000);
      expect(tracker.timeout).toEqual(5000);
    });

    it("throws when URL is not provided", () => {
      expect(() => new Tracker()).toThrow("url argument is required");
    });
  });

  describe("send", () => {
    var tracker = new Tracker("https://example.com");

    describe("Beacon API available", () => {
      beforeEach(() => {
        spyOn(navigator, "sendBeacon");
      });

      it("sends data via Beacon API", () => {
        tracker.send("pageview", "search", "manual", {a: "a", b: 49, c: [1,2,3]});
        // TODO: write a custom matcher that checks the form data
        expect(navigator.sendBeacon).toHaveBeenCalledWith(url, new FormData());
      });
    });

    describe("Beacon API not available", () => {

    });
  });
});
