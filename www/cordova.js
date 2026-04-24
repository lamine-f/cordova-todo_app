// Stub cordova.js for browser development.
// The real cordova.js is injected by the platform build (platforms/android/...).
// This file fires deviceready so the app bootstraps normally in a browser.
document.addEventListener('DOMContentLoaded', function() {
  var event = new Event('deviceready');
  document.dispatchEvent(event);
});
