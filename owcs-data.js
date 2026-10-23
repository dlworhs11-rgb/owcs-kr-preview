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
    // 인스타: the official Instagram reels the build fetches (owcs_cloud.ig_reels), for the 방송 예정 box. Use with &date=<match day>&time=12:00
    ig: function () {
      O.igReels = ['DeynsrKTCGE', 'DeynHf8Tgm1', 'DeyhWvITstt', 'Deyg0H7zKxX', 'DeygSiKTSw0', 'DewC6irTgXr'];
    },
    // 1경기 끝: the day's first match over at 3:1 with maps, bans and POTM. Use with &date=<match day>&time=<between game 1 and 2>
    g1done: function () {
      var d = (location.search.match(/[?&]date=([\d-]+)/) || [])[1] || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
      var m = O.matches.filter(function (x) { return x.day === d; })[0];
      if (!m) return;
      var P = [['Busan', '쟁탈', 'a', 2, 1, 'sombra', 'ana'], ['Kings Row', '혼합', 'b', 2, 3, 'cassidy', 'dva'], ['New Junk City', '플래시포인트', 'a', 3, 1, 'tracer', 'mauga'], ['Rialto', '호위', 'a', 3, 2, 'genji', 'kiriko']];
      m.maps = P.map(function (p, i) {
        return { no: i + 1, map: p[0], mode: p[1], winner: p[2], sa: p[3], sb: p[4], banFirst: 'a', bans: [{ t: 'a', h: p[5], code: p[5].slice(0, 3).toUpperCase() }, { t: 'b', h: p[6], code: p[6].slice(0, 3).toUpperCase() }] };
      });
      m.sa = 3; m.sb = 1; m.played = true; m.live = false;
      m.potm = (O.players.filter(function (p) { return p.team === m.a; })[0] || {}).id || null;
    },
    // 경기일 끝: every match of that day over (3:1, 2:3, 3:0 ...) with maps, bans and POTM, earlier unplayed days given
    // plain scores, standings recounted from them. Use with &date=<match day>&time=23:00
    daydone: function () {
      var d = (location.search.match(/[?&]date=([\d-]+)/) || [])[1] || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
      var S = [[3, 1], [2, 3], [3, 0], [1, 3], [3, 2]], k = 0;
      var P = [['Busan', '쟁탈', 'sombra', 'ana'], ['Kings Row', '혼합', 'cassidy', 'dva'], ['New Junk City', '플래시포인트', 'tracer', 'mauga'], ['Rialto', '호위', 'genji', 'kiriko'], ['Lijiang Tower', '쟁탈', 'widowmaker', 'lucio']];
      O.matches.forEach(function (m) {
        if (m.phase !== 'rs' || (m.played && !m.live) || m.day > d) return;
        var s = S[k++ % S.length], ra = s[0], rb = s[1], w = [];
        while (ra + rb > 1) { var x = (ra + rb) % 2 ? (ra >= rb ? 'a' : 'b') : (rb > 0 ? 'b' : 'a'); if (x === 'a' && !ra) x = 'b'; if (x === 'b' && !rb) x = 'a'; w.push(x); if (x === 'a') ra--; else rb--; }
        w.push(s[0] > s[1] ? 'a' : 'b');
        m.maps = m.day === d ? w.map(function (x, i) {
          var p = P[i], sc = p[1] === '쟁탈' ? 2 : 3;
          return { no: i + 1, map: p[0], mode: p[1], winner: x, sa: x === 'a' ? sc : sc - 1, sb: x === 'b' ? sc : sc - 1, banFirst: 'a', bans: [{ t: 'a', h: p[2], code: p[2].slice(0, 3).toUpperCase() }, { t: 'b', h: p[3], code: p[3].slice(0, 3).toUpperCase() }] };
        }) : [];
        m.sa = s[0]; m.sb = s[1]; m.played = true; m.live = false;
        m.potm = (O.players.filter(function (p) { return p.team === (s[0] > s[1] ? m.a : m.b); })[0] || {}).id || null;
      });
      var tab = {};
      O.standings.forEach(function (s) { tab[s.a] = { a: s.a, w: 0, l: 0, mw: 0, ml: 0, diff: 0 }; });
      O.matches.forEach(function (m) {
        if (m.phase !== 'rs' || !m.played || m.live || !tab[m.a] || !tab[m.b]) return;
        var A = tab[m.a], B = tab[m.b];
        A.mw += m.sa; A.ml += m.sb; B.mw += m.sb; B.ml += m.sa;
        if (m.sa > m.sb) { A.w++; B.l++; } else { B.w++; A.l++; }
      });
      O.standings = Object.keys(tab).map(function (x) { var t = tab[x]; t.diff = t.mw - t.ml; return t; })
        .sort(function (x, y) { return y.w - x.w || y.diff - x.diff; });
    },
    // 방송 12명: 12 players with a channel live at once, spread over the teams in turn, live check just now
    live12: function () {
      var by = {}, order = [], pick = [];
      O.players.forEach(function (p) {
        if (!(p.chzzk || p.soop)) return;
        if (!by[p.team]) { by[p.team] = []; order.push(p.team); }
        by[p.team].push(p);
      });
      for (var i = 0; pick.length < 12 && order.some(function (t) { return by[t][i]; }); i++)
        order.forEach(function (t) { if (pick.length < 12 && by[t][i]) pick.push(by[t][i]); });
      O.live = {};
      pick.forEach(function (p) { O.live[p.id] = p.chzzk || p.soop; });
      O.liveChecked = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 19) + '+09:00';
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
