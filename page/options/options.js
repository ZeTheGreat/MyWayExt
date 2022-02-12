chrome.runtime.sendMessage(
  { type: "sys", message: MESSAGESTYLE },
  ({ message }) => {
    stylePage(message);
  }
);

cHandler = {
  colors: document.querySelector("#colors-select"),
  import: document.querySelector("#import-button"),
  importText: document.querySelector("#import-text"),
  importErro: document.querySelector("#import-info"),
  export: document.querySelector("#export-button"),
  exportText: document.querySelector("#export-text"),
};

chrome.runtime.sendMessage(
  { type: "sys", message: GETMESSAGESTYLES },
  ({ message: [listStyles, selectedStyle] }) => {
    listStyles.forEach((element) => {
      const opt = document.createElement("option");
      opt.innerText = element;
      cHandler.colors.append(opt);
    });
    cHandler.colors.value = selectedStyle;
  }
);

function showError(message, where, input) {
  where.style.display = "inline-block";
  where.innerText = message;
  where.classList.add("error");
  input.classList.add("error");
}

function showInfo(message, where) {
  where.style.display = "inline-block";
  where.innerText = message;
}

function hideError(where, input) {
  where.style.display = "none";
  where.innerText = "";
  where.classList.remove("error");
  input.classList.remove("error");
}

cHandler.import.addEventListener("click", () => {
  try {
    var importValue = JSON.parse(cHandler.importText.value);
  } catch (e) {
    showError(
      "The import must be structured like JSON",
      cHandler.importErro,
      cHandler.importText
    );
    return false;
  }
  importValue.type = "sys";
  chrome.runtime.sendMessage(importValue, ({ message }) => {
    if (message === "Imported!") {
      cHandler.importText.value = "";
      hideError(cHandler.importErro, cHandler.importText);
      showInfo(message, cHandler.importErro);
    } else {
      showError(message, cHandler.importErro, cHandler.importText);
    }
  });
});

cHandler.export.addEventListener("click", () => {
  chrome.runtime.sendMessage(
    { type: "sys", message: "__ExportWhiteList__" },
    (resp) => {
      cHandler.exportText.value = JSON.stringify(resp);
    }
  );
});

cHandler.colors.addEventListener("change", ({ target }) => {
  const style = target.value;
  chrome.runtime.sendMessage({ type: "sys", message: style }, ({ message }) => {
    if (message === "New Style updated") stylePage(style);
  });
});

cHandler.exportText.addEventListener("click", ({ target }) => {
  target.select();
  document.execCommand("Copy");
});
