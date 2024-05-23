chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request, sender);
  const id = sender.tab.id;
  if (request.action == "getSelection") {
    chrome.scripting
      .executeScript({
        target: { tabId: id, allFrames: true },
        func: () => {
          return window.getSelection().toString();
        },
      })
      .then((res) => {
        console.log(res);
        sendResponse({ data: res[0]["result"] });
      });
  } else if (request.action == "writeText") {
    function writeTextToInput(text) {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        activeElement.value = `${activeElement.value}${text}`;

        if (activeElement.tagName === "TEXTAREA") {
          activeElement.scrollTop = activeElement.scrollHeight;
        }
      } else {
        console.warn("No active input or textarea field found.");
      }
    }
    chrome.scripting.executeScript({
      target: { tabId: id, allFrames: true },
      func: writeTextToInput,
      args: [request.text],
    });
    sendResponse({});
  } else {
    sendResponse({});
  }

  return true;
});
