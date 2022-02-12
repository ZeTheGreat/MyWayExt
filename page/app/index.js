chrome.runtime.sendMessage(
  { type: "sys", message: MESSAGESTYLE },
  ({ message }) => {
    stylePage(message);
  }
);

(function () {
  function gerneratorPages(
    links,
    head,
    headId,
    headTag,
    body,
    bodyId,
    bodyTag
  ) {
    let auxiliarTag;
    let auxiliarTagHead;
    let auxiliarMultiTag;
    let count = 0;

    links.forEach(({ name, url, active }) => {
      if (active) {
        // header create -*- header create -*- header create -*- header create -*
        const idFrame = `${bodyId + count}`;
        auxiliarTagHead = document.createElement(headTag);
        auxiliarTagHead.id = `${headId + count}`;
        auxiliarTagHead.innerHTML = `<a class="linkHeader" href='#${idFrame}'>${name}</a>`;

        auxiliarTag = document.createElement("div");
        auxiliarTag.id = idFrame;
        auxiliarTag.style.height = "1200px";

        auxiliarMultiTag = document.createElement(bodyTag);

        auxiliarMultiTag.style["width"] = "100%";
        auxiliarMultiTag.style["height"] = "100%";
        auxiliarMultiTag.style["scroll"] = "";

        auxiliarMultiTag.src = url;

        auxiliarTag.append(auxiliarMultiTag);

        head.append(auxiliarTagHead);
        body.append(auxiliarTag);

        count++;
      }
    });
    return [head, body];
  }

  class TimeManager {
    constructor(timeout, page) {
      this.page = page;
      this.isPlayed = true;
      this.setInterval(timeout);
    }

    setInterval(newTimeout) {
      this.timeout = newTimeout * 1000;
      this.resetInterval();
    }

    setPage(newPage) {
      this.page = newPage;
    }

    resetInterval() {
      this.stopInterval();

      this.isPlayed = true;
      this.inputTime = setInterval(this.updatePage, this.timeout, this);
    }

    updatePage(self) {
      const listHeader = document.querySelectorAll(".linkHeader");
      self.page = listHeader.length > self.page ? self.page + 1 : 1;
      listHeader[self.page - 1].click();
    }

    stopInterval() {
      clearInterval(this.inputTime);
      this.isPlayed = false;
    }
  }

  let PAGE_LIST = [];

  chrome.runtime.sendMessage(
    { type: "sys", message: "__pageList__" },
    ({ message: PLS }) => {
      PAGE_LIST = PLS ? PLS : [];
      if (PAGE_LIST.length === 0)
        return (document.querySelector("#info").innerHTML =
          document.createElement("div").innerHTML =
            `<h1 style="font-size:45px;margin-top:15%;width:100%; height:20%; text-align:center;">No pages registered or active</h1>`);

      gerneratorPages(
        PAGE_LIST,
        document.getElementById("menu"),
        "option",
        "li",
        document.getElementById("nav-bar"),
        "frame",
        "iframe"
      );

      let send;

      let tabs = $("#nav-bar").tabs();
      tabs.find(".ui-tabs-nav").sortable({
        axis: "x",
        stop: function (_, whoList) {
          clearTimeout(send);
          const who = whoList.item[0];
          const pageId = Array.from(who.id).pop();
          who.children[0].click();
          tabs.tabs("refresh");

          const tabsList = Array.from(document.querySelectorAll(".linkHeader"));
          const tabList = [];
          let position = 0;

          tabsList.forEach((aTag) => {
            const tabId = aTag.href.split("#").pop();
            const tabText = aTag.innerText;
            position++;
            if (pageId === Array.from(tabId).pop()) {
              timeManager.setPage(position);
            }

            iframeUrl = $("#" + tabId)
              .find("iframe")
              .attr("src");
            tabList.push({ name: tabText, active: true, url: iframeUrl });
          });

          const importValue = { type: "sys", message: tabList };

          send = setTimeout(() => {
            chrome.runtime.sendMessage(importValue, ({ message }) => {
              console.log(message);
            });
          }, 5000);
        },
      });

      const inputTime = document.getElementById("input-time");

      const timeManager = new TimeManager(10, 0);

      document.addEventListener("click", (event) => {
        let target = event.target;
        if (target.tagName.toUpperCase() === "BUTTON") {
          if (target.id === "play") {
            if (timeManager.isPlayed) {
              timeManager.isPlayed = false;
              timeManager.stopInterval();
              document.getElementById(`play`).innerText = "■";
            } else {
              timeManager.isPlayed = true;
              timeManager.resetInterval();
              document.getElementById(`play`).innerText = "▶";
            }
          }
        } else if (target.classList.contains("linkHeader")) {
          if (event.isTrusted) {
            const pageId = target.id.split("-").pop();
            timeManager.setPage(pageId - 1);
          }
        }
      });

      inputTime.addEventListener("blur", (event) => {
        let target = event.target;
        let value = parseInt(target.value);
        if (
          value === "" ||
          typeof value !== "number" ||
          Number.isNaN(value) === true
        ) {
          target.value = 10;
          return;
        }

        timeManager.setInterval(value);
      });
    }
  );
})();
