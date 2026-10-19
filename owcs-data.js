// preview site: the data is the real site's current owcs-data.js (same origin), loaded in place of this file
(function () {
  var x = new XMLHttpRequest();
  x.open('GET', '/owcs-kr/owcs-data.js?v=' + Date.now(), false);
  x.send();
  (0, eval)(x.responseText);
})();
