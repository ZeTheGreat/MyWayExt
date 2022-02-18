chrome.runtime.sendMessage(
  { type: "sys", message: MESSAGESTYLE },
  ({ message }) => {
    stylePage(message);
  }
);

const cHandler = {
  whiteList: document.querySelector("#white-list"),
  inputUrl: document.querySelector("#url"),
  inputName: document.querySelector("#name"),
  inputDesc: document.querySelector("#description"),
  spamErrorUrl: document.querySelector("#error-info-url"),
  spamErrorName: document.querySelector("#error-info-name"),
  spamErrorDesc: document.querySelector("#error-info-desc"),
  addButton: document.querySelector("#button-add"),
  startButton: document.querySelector("#button-start"),
  copyIcon: document.querySelector(".copy-icon"),
};

function renderUrlList(newList) {
  newList.forEach(({ name, url, desc, active }) => {
    const newRow = document.createElement("li");
    const delIcon = document.createElement("i");
    const visIcon = document.createElement("i");
    const uptIcon = document.createElement("i");

    delIcon.classList.add("material-icons");
    visIcon.classList.add("material-icons");
    uptIcon.classList.add("material-icons");

    delIcon.classList.add("ex");
    visIcon.classList.add("vs");
    uptIcon.classList.add("up");

    delIcon.innerHTML = "close";
    visIcon.innerHTML = active ? "visibility" : "visibility_off";
    uptIcon.innerHTML = "edit";

    newRow.appendChild(delIcon);
    newRow.appendChild(visIcon);
    newRow.appendChild(uptIcon);

    newRow.innerHTML += `<label class="name-lbl">${name}</label> <label>|</label> <label class="url-lbl">${url}</label>`;

    newRow.description = desc

    cHandler.whiteList.appendChild(newRow);
  });
}

function delUrlList(newList) {
  newList.forEach((url) => {
    cHandler.whiteList.removeChild(url);
  });
}

function visUrlList(newList) {
  newList.forEach((url) => {
    const iconVis = findInLiByClass(url.children, "vs");
    const isVis = iconVis.innerHTML === "visibility";
    iconVis.innerHTML = isVis ? "visibility_off" : "visibility";
  });
}

function findInLiByClass(li, classWho) {
  for (index in li) {
    const obj = li[index];
    try {
      if (obj.classList.contains(classWho)) return obj;
    } catch (er) {}
  }
  return false;
}

function showError(message, spam, input) {
  spam.classList.add("error");
  spam.innerHTML = message;

  input.classList.add("error");
}

function hideError(spam, input) {
  spam.classList.remove("error");
  input.classList.remove("error");

  spam.innerHTML = "";
}

// Start MiniPage -*- Start MiniPage -*- Start MiniPage -*- Start MiniPage
chrome.runtime.sendMessage(
  { message: "__fillWhiteList__", type: "sys" },
  ({ message }) => {
    renderUrlList(message);
  }
);

// Start App -*- Start App -*- Start App -*- Start App -*- Start App
cHandler.startButton.addEventListener("click", (ev) => {
  ev.preventDefault();
  window.open("/page/app/index.html");
});


cHandler.addButton.addEventListener("click", (ev) => {
  ev.preventDefault();

  const url = cHandler.inputUrl.value;
  const name = cHandler.inputName.value;
  const desc = cHandler.inputDesc.value;
  const active = url !== '' ? true : false;

  if (!name) {
    return showError("Empty name", cHandler.spamErrorName, cHandler.inputName);
  }

  hideError(cHandler.spamErrorName, cHandler.inputName);

  // upt URL -*- upt URL -*- upt URL -*- upt URL -*- upt URL -*- upt URL
  if( cHandler.addButton.innerText === "UPDATE" ){
    const selectedElement = cHandler.helperHandle
    const children = selectedElement.children;
    const label = findInLiByClass(children, "name-lbl");

    return chrome.runtime.sendMessage(
      { message: { 
        oldName: label.innerHTML, 
        name: cHandler.inputName.value, 
        url: cHandler.inputUrl.value,
        desc: cHandler.inputDesc.value
      }, type: "upt" },
      ({message, error, spam, input}) => {
        if (error) {
          return showError(message, cHandler[spam], cHandler[input]);
        }
        hideError(cHandler.spamErrorUrl, cHandler.inputUrl);
        hideError(cHandler.spamErrorName, cHandler.inputName);
        console.log(message)
        delUrlList([selectedElement]);
        renderUrlList([message]);

        cHandler.inputUrl.value = "";
        cHandler.inputName.value = "";
        cHandler.inputDesc.value = "";
        cHandler.addButton.innerText = "ADD";
        cHandler.helperHandle = "";
      }
    );   
  }

  // Add URL -*- Add URL -*- Add URL -*- Add URL -*- Add URL -*- Add URL
  return chrome.runtime.sendMessage(
    { message: { name, url, desc, active }, type: "add" },
    ({ message, error, spam, input }) => {
      if (error) {
        return showError(message, cHandler[spam], cHandler[input]);
      }

      hideError(cHandler.spamErrorUrl, cHandler.inputUrl);
      hideError(cHandler.spamErrorName, cHandler.inputName);
      renderUrlList([message]);

      cHandler.inputUrl.value = "";
      cHandler.inputName.value = "";
      cHandler.inputDesc.value = "";
    }
  );
});

// Del URL -*- Tgl URL -*- Del URL -*- Tgl URL -*- Del URL -*- Tgl URL
cHandler.whiteList.addEventListener("click", ({ target }) => {
  const parentElement = target.tagName === "LI" ? target : target.parentElement;

  const children = parentElement.children;
  const label = findInLiByClass(children, "name-lbl");
  const url = findInLiByClass(children, "url-lbl");

  if (target.tagName === "I") {
    if (target.classList.contains("ex")) {
      chrome.runtime.sendMessage(
        { message: { name: label.innerHTML }, type: "del" },
        () => delUrlList([parentElement])
      );
    }
    if (target.classList.contains("vs")) {
      chrome.runtime.sendMessage(
        { message: { name: label.innerHTML }, type: "vis" },
        () => visUrlList([parentElement])
      );
    }
    if (target.classList.contains("up")) {
      cHandler.inputName.value = label.innerText;
      cHandler.inputUrl.value = url.innerText;
      cHandler.inputDesc.value = parentElement.description;
      cHandler.addButton.innerText = 'UPDATE';
      cHandler.helperHandle = parentElement;
    }
  } else if (target.tagName === "LABEL" || target.tagName === "LI") {
    cHandler.inputName.value = label.innerText;
    cHandler.inputUrl.value = url.innerText;
    cHandler.inputDesc.value = parentElement.description;
  }
});

// Copy URL -*- Copy URL -*- Copy URL -*- Copy URL -*- Copy URL -*- Copy URL
cHandler.copyIcon.addEventListener("click", () => {
  cHandler.inputUrl.select();
  document.execCommand("Copy");
});
