// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { getContentFromActiveLinkedInPage } from "./_browser.js";

function createPage(url, html, closed = false) {
  return {
    isClosed() {
      return closed;
    },
    url() {
      return url;
    },
    async waitForLoadState() {},
    async content() {
      if (closed) throw new Error("page.content: Target page, context or browser has been closed");
      return html;
    },
  };
}

test("reads the latest open profile page after interactive login", async () => {
  const firstPage = createPage("https://www.linkedin.com/feed/", "<html>feed</html>", true);
  const profilePage = createPage("https://www.linkedin.com/in/pixu1980/", "<html>profile</html>");
  const context = {
    pages() {
      return [firstPage, profilePage];
    },
  };

  const html = await getContentFromActiveLinkedInPage(context, {
    profile: "https://www.linkedin.com/in/pixu1980/",
  });

  assert.equal(html, "<html>profile</html>");
});
