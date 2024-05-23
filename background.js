chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // read changeInfo data and do something with it (like read the url)
  if (changeInfo.url) {
    // do something here
    chrome.tabs.sendMessage(tabId, {
      message: "urlChange",
      url: changeInfo.url,
    });
  }
});
