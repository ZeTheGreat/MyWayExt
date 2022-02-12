const HEADERS_TO_STRIP_LOWERCASE = ["x-frame-options", "frame-options"];

const URL_OR_EMPTY_REGEX =
  /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/;

const WHITE_LIST_CROSS_FIRST = [
  "*://one.newrelic.com/*",
  "*://goal.ciandt.com/*",
  "*://login.newrelic.com/*",
  "*://ab-inbev.atlassian.net/*",
  "*://ab-inbev.visualstudio.com/*",
  "*://analytics.amplitude.com/*",
  "*://trello.com/*",
];

const STYLE_LIST = ["CI&T", "BEES"];

let PAGE_LIST = [];

let STYLE_PAGE = "CI&T";

let WHITE_LIST_CROSS = [];

chrome.storage.sync.get("PAGE_LIST_STORED", ({ PAGE_LIST_STORED }) => {
  PAGE_LIST = PAGE_LIST_STORED ? PAGE_LIST_STORED : [];
});

chrome.storage.sync.get("STYLE_PAGE_STORED", ({ STYLE_PAGE_STORED }) => {
  STYLE_PAGE = STYLE_PAGE_STORED ? STYLE_PAGE_STORED : "CI&T";
});

// Communication with front Extension -*- Communication with front Extension
chrome.runtime.onMessage.addListener(({ message, type }, _, sendResponse) => {
  // Initialize the List
  if (type === "sys") {
    // Just used in popup white list
    if (message === "__fillWhiteList__") {
      sendResponse({ message: PAGE_LIST });
    }
    // Fill the monitoring panel
    if (message === "__pageList__") {
      sendResponse({ message: PAGE_LIST.filter(({ active }) => active) });
    }
    // Export white list used in Options page
    else if (message === "__ExportWhiteList__") {
      sendResponse({ message: PAGE_LIST });
    }
    // Export the style of ext
    else if (message === "__Style__") {
      sendResponse({ message: STYLE_PAGE });
    }
    // Export style list for load select in options
    else if (message === "__GetStyles__") {
      sendResponse({ message: [STYLE_LIST, STYLE_PAGE] });
    }
    // Change the style of ext
    else if (STYLE_LIST.includes(message)) {
      STYLE_PAGE = message;
      sendResponse({ message: "New Style updated" });
      chrome.storage.sync.set({ STYLE_PAGE_STORED: STYLE_PAGE });
    }
    // Import white list used in Options page
    else if (Array.isArray(message)) {
      for (index in message) {
        const el = message[index];
        const i = index * 1;
        if (Object.keys(el).length !== 3)
          return sendResponse({
            message: `The ${i + 1}º object of white list must have three keys`,
          });
        if (typeof el.name !== "string")
          return sendResponse({
            message: `${i + 1}º object: The name property must be string`,
          });
        if (typeof el.active !== "boolean")
          return sendResponse({
            message: `${i + 1}º object: The active property must be boolean`,
          });
        if (typeof el.url !== "string" || !URL_OR_EMPTY_REGEX.test(el.url))
          return sendResponse({
            message: `${i + 1}º object: The url property must be a valid url`,
          });
      }

      PAGE_LIST = message;
      chrome.storage.sync.set({ PAGE_LIST_STORED: message });

      sendResponse({ message: "Imported!" });
    } else sendResponse({ message: "Bad Request" });
  } else {
    // Func -*- Func -*- Func -*- Func -*- Func -*- Func -*- Func -*-
    const { name: nameNew, url: urlNew } = message;
    const isInListName = PAGE_LIST.some(({ name }) => name === nameNew);
    const isInListUrl = PAGE_LIST.some(({ url }) => url === urlNew);
    // Add -*- Add -*- Add -*- Add -*- Add -*- Add -*- Add -*- Add -*-
    if (type === "add") {
      if (isInListName)
        return sendResponse({
          message: "Name is already in use",
          error: true,
          spam: "spamErrorName",
          input: "inputName",
        });
      if (isInListUrl)
        return sendResponse({
          message: "Url is already in use",
          error: true,
          spam: "spamErrorUrl",
          input: "inputUrl",
        });
      if (!URL_OR_EMPTY_REGEX.test(urlNew))
        return sendResponse({
          message: "Invalid url",
          error: true,
          spam: "spamErrorUrl",
          input: "inputUrl",
        });
      PAGE_LIST.push({ ...message });
    }
    // Del -*- Del -*- Del -*- Del -*- Del -*- Del -*- Del -*- Del -*-
    else if (type === "del") {
      if (!isInListName)
        return sendResponse({
          message: "This name does not exist's in list",
          error: true,
        });
      PAGE_LIST = PAGE_LIST.filter(({ name }) => name !== nameNew);
    }
    // Vis -*- Vis -*- Vis -*- Vis -*- Vis -*- Vis -*- Vis -*- Vis -*-
    else if (type === "vis") {
      if (!isInListName)
        return sendResponse({
          message: "This name does not exist's in list",
          error: true,
        });
      PAGE_LIST = PAGE_LIST.map((obj) => {
        const { name, active } = obj;
        if (name === nameNew) {
          obj.active = !active;
        }
        return obj;
      });
    }
    chrome.storage.sync.set({ PAGE_LIST_STORED: PAGE_LIST });
    sendResponse({ message: message });
  }
});

// CROSS -*- CROSS -*- CROSS -*- CROSS -*- CROSS -*- CROSS -*- CROSS -*-
chrome.storage.sync.get(
  "WHITE_LIST_CROSS_STORED",
  ({ WHITE_LIST_CROSS_STORED }) => {
    WHITE_LIST_CROSS = WHITE_LIST_CROSS_STORED
      ? WHITE_LIST_CROSS_STORED
      : WHITE_LIST_CROSS_FIRST;

    chrome.webRequest.onHeadersReceived.addListener(
      (details) => ({
        responseHeaders: details.responseHeaders.filter(
          (header) =>
            !HEADERS_TO_STRIP_LOWERCASE.includes(header.name.toLowerCase())
        ),
      }),
      {
        urls: WHITE_LIST_CROSS,
      },
      ["blocking", "responseHeaders"]
    );
  }
);
