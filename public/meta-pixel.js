// Public Meta Pixel ID only. API access tokens must never be placed here.
(function (window, document) {
  if (window.__sideHustlePixelLoaded) return;
  window.__sideHustlePixelLoaded = true;
  if (!window.fbq) {
    var pixel = function () {
      if (pixel.callMethod) pixel.callMethod.apply(pixel, arguments);
      else pixel.queue.push(arguments);
    };
    window.fbq = pixel;
    if (!window._fbq) window._fbq = pixel;
    pixel.push = pixel;
    pixel.loaded = true;
    pixel.version = "2.0";
    pixel.queue = [];
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  window.fbq("init", "1408611880988960");
  window.fbq("track", "PageView");
})(window, document);
