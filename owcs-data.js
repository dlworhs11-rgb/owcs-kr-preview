// preview site: the data is the real site's current owcs-data.js (same origin), loaded in place of this file
(function () {
  var x = new XMLHttpRequest();
  x.open('GET', 'https://owticker.com/owcs-data.js?v=' + Date.now(), false);
  x.send();
  (0, eval)(x.responseText);
  // ?test=<name>: made-up data to show a feature that the real data doesn't trigger yet (preview only)
  var t = (location.search.match(/[?&]test=([\w-]+)/) || [])[1], O = window.OWCS, TESTS = {
    // 단두대 매치: every regular-season match played except PF vs SEIJI, both on 2 wins, everyone else on 4+
    axe: function () {
      var keep = null;
      O.matches.forEach(function (m) {
        if ((m.phase && m.phase !== 'rs') || (m.played && !m.live)) return;
        if (!keep && [m.a, m.b].sort().join() === 'PF,SEIJI') { keep = m; m.played = false; m.live = false; return; }
        m.played = true; m.live = false; m.date = '2026-10-01';
      });
      var W = { ZETA: 7, CR: 7, T1: 6, CB: 5, FLC: 5, O2: 4, ZAN: 4, PF: 2, SEIJI: 2 };
      O.standings.forEach(function (s) { if (W[s.a] != null) { s.w = W[s.a]; s.l = (s.a === 'PF' || s.a === 'SEIJI' ? 6 : 7) - s.w; } });
      O.standings.sort(function (a, b) { return b.w - a.w; });
    }
  };
  if (t && TESTS[t] && O) {
    TESTS[t]();
    document.addEventListener('DOMContentLoaded', function () {
      var b = document.createElement('div');
      b.textContent = '테스트 데이터 (미리보기 전용): ' + t;
      b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;padding:6px 10px;border-radius:8px;background:#E5484D;color:#fff;font:700 12px system-ui';
      document.body.appendChild(b);
    });
  }
})();
