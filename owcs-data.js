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
    },
    // 생일: the first player of every team has a birthday today (KST)
    bday: function () {
      var td = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), seen = {};
      O.players.forEach(function (p) { if (!seen[p.team]) { seen[p.team] = 1; p.birth = '2000' + td.slice(4); } });
    },
    // 동률: SEIJI and ZAN level on wins and set difference, SEIJI above on head-to-head (the build's standings[].tie)
    tie: function () {
      O.standings.forEach(function (s) { if (s.a === 'SEIJI') s.tie = [1, 0]; if (s.a === 'ZAN') s.tie = [0, 1]; });
    },
    // LCQ: seeding deciders done (ZETA CR T1 CB), LCQ 5v6 and 7v8 played, losers final + 8강 waiting. Use with &date=2026-11-01
    lcq: function () {
      var set = function (id, a, b, sa, sb) {
        var m = O.matches.filter(function (x) { return x.id === '2026s3-' + id; })[0];
        if (!m) return;
        m.a = a; m.b = b; m.tbd = false;
        if (sa != null) { m.sa = sa; m.sb = sb; m.played = true; m.live = false; }
      };
      set('p0', 'ZETA', 'CR', 3, 1); set('p1', 'T1', 'CB', 3, 2); set('p2', 'ZETA', 'T1', 3, 0);
      set('p3', 'CR', 'CB', 3, 1); set('p4', 'ZETA', 'CB', 3, 1); set('p5', 'CR', 'T1', 3, 2);
      set('p6', 'FLC', 'O2', 3, 2); set('p7', 'SEIJI', 'ZAN', 1, 3); set('p8', 'O2', 'ZAN');
      set('p9', 'CB', 'FLC'); set('p10', 'T1', 'TBD'); set('p11', 'ZETA', 'TBD'); set('p12', 'CR', 'TBD');
      var st = {}; O.standings.forEach(function (s) { st[s.a] = s; });
      O.bracket.seeding = [['ZETA', 3, 0], ['CR', 2, 1], ['T1', 1, 2], ['CB', 0, 3]].map(function (r) {
        return { a: r[0], w: st[r[0]].w + r[1], l: st[r[0]].l + r[2], sw: r[1], sl: r[2] };
      });
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
