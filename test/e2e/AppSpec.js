describe("bookmark read later app", function() {
  const unreadTab = element(by.id("unreadTab"));
  const readTab = element(by.id("readTab"));
  const searchTab = element(by.id("searchTab"));
  const unreadTabLink = element(by.css("a[href='#unreadTab']"));
  const readTabLink = element(by.css("a[href='#readTab']"));
  const searchTabLink = element(by.css("a[href='#searchTab']"));

  beforeEach(function() {
    browser.waitForAngularEnabled(false);
    browser.get("/");
  });

  describe("tabs should be changed", function() {
    it("unread tab should be active", function() {
      expect(unreadTab.getAttribute("class")).toMatch("active");
    });

    it("read tab should be active", function() {
      readTabLink.click();
      expect(readTab.getAttribute("class")).toMatch("active");
    });

    it("search tab should be active", function() {
      searchTabLink.click();
      expect(searchTab.getAttribute("class")).toMatch("active");
    });

    it("unread tab should be active", function() {
      expect(unreadTab.getAttribute("class")).toMatch("active");
      readTabLink.click();
      expect(readTab.getAttribute("class")).toMatch("active");
      unreadTabLink.click();
      expect(unreadTab.getAttribute("class")).toMatch("active");
    });
  });

  describe("bookmark should be added", function() {
    const form = unreadTab.element(by.tagName("form"));
    console.log(form);
    const titleInput = form.element
      .all(by.css("input-field"))
      .get(0)
      .element(by.tagName("input"));
    if (
      ("bookmark should be added",
      function() {
        titleInput.sendKeys("bookmark1");
        browser.pause();
      })
    );
  });
});
