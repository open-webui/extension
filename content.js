// Create a div to host the React app
const appDiv = document.createElement("div");
appDiv.id = "extension-app";
document.body.appendChild(appDiv);

// Function to inject a script
function injectScript(file, node) {
  const th = document.getElementsByTagName(node)[0];
  const s = document.createElement("script");
  s.setAttribute("type", "text/javascript");
  s.setAttribute("src", file);
  th.appendChild(s);
}

// Function to inject a CSS file
function injectCSS(file) {
  const link = document.createElement("link");
  link.href = file;
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
}

// Inject the CSS and JS files
injectCSS(chrome.runtime.getURL("extension/dist/style.css"));
// injectScript(chrome.runtime.getURL("extension/dist/main.js"), "body");
