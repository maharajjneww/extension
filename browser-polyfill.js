// Browser compatibility layer for Chrome and Firefox
(function() {
  if (typeof browser === 'undefined') {
    // Chrome uses 'chrome', Firefox uses 'browser'
    // This makes Chrome work with 'browser' namespace
    window.browser = chrome;
  }
})();
