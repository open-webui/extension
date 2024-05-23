chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request, sender);
  const id = sender.tab.id;
  if (request.method == "getSelection") {
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
  } else {
    sendResponse({});
  }

  return true;
});
