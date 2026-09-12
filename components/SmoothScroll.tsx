'use client';

import { useEffect } from 'react';

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let destroyFn: (() => void) | null = null;

    try {
      var s: any,
        i: any,
        c: any,
        a: any,
        o = {
          frameRate: 300,
          animationTime: 600,
          stepSize: 100,
          pulseAlgorithm: !0,
          pulseScale: 4,
          pulseNormalize: 1,
          accelerationDelta: 50,
          accelerationMax: 3,
          keyboardSupport: !0,
          arrowScroll: 50,
          fixedBackground: !0,
          excluded: '',
        },
        p = o,
        u = !1,
        d = !1,
        n = {
          x: 0,
          y: 0,
        },
        f = !1,
        m = document.documentElement,
        l: any[] = [],
        h = /^Mac/.test(navigator.platform),
        w: Record<string, number> = {
          left: 37,
          up: 38,
          right: 39,
          down: 40,
          spacebar: 32,
          pageup: 33,
          pagedown: 34,
          end: 35,
          home: 36,
        },
        v: Record<number, number> = {
          37: 1,
          38: 1,
          39: 1,
          40: 1,
        };

      function y() {
        if (!f && document.body) {
          f = !0;
          var e = document.body,
            t = document.documentElement,
            o = window.innerHeight,
            n = e.scrollHeight;
          if (
            ((m = 0 <= document.compatMode.indexOf('CSS') ? t : e),
            (s = e),
            p.keyboardSupport && Y('keydown', x),
            top != self)
          )
            d = !0;
          else if (Q && o < n && (e.offsetHeight <= o || t.offsetHeight <= o)) {
            var r: any,
              aEl = document.createElement('div');
            (aEl.style.cssText =
              'position:absolute; z-index:-10000; top:0; left:0; right:0; height:' +
              m.scrollHeight +
              'px'),
              document.body.appendChild(aEl),
              (c = function () {
                r =
                  r ||
                  setTimeout(function () {
                    u ||
                      ((aEl.style.height = '0'),
                      (aEl.style.height = m.scrollHeight + 'px'),
                      (r = null));
                  }, 500);
              }),
              setTimeout(c, 10),
              Y('resize', c);
            if (
              ((i = new R(c)).observe(e, {
                attributes: !0,
                childList: !0,
                characterData: !1,
              }),
              m.offsetHeight <= o)
            ) {
              var lEl = document.createElement('div');
              (lEl.style.clear = 'both'), e.appendChild(lEl);
            }
          }
          p.fixedBackground ||
            u ||
            ((e.style.backgroundAttachment = 'scroll'),
            (t.style.backgroundAttachment = 'scroll'));
        }
      }

      var b: any[] = [],
        g = !1,
        r = Date.now();

      function S(dEl: any, fVal: any, mVal: any) {
        if (
          ((function (e: any, t: any) {
            (e = 0 < e ? 1 : -1),
              (t = 0 < t ? 1 : -1),
              (n.x === e && n.y === t) ||
                ((n.x = e), (n.y = t), (b = []), (r = 0));
          })(fVal, mVal),
          1 != p.accelerationMax)
        ) {
          var e = Date.now() - r;
          if (e < p.accelerationDelta) {
            var t = (1 + 50 / e) / 2;
            1 < t &&
              ((t = Math.min(t, p.accelerationMax)), (fVal *= t), (mVal *= t));
          }
          r = Date.now();
        }
        if (
          (b.push({
            x: fVal,
            y: mVal,
            lastX: fVal < 0 ? 0.99 : -0.99,
            lastY: mVal < 0 ? 0.99 : -0.99,
            start: Date.now(),
          }),
          !g)
        ) {
          var oVal = q(),
            hVal = dEl === oVal || dEl === document.body;
          null == dEl.$scrollBehavior &&
            (function (e: any) {
              var t = M(e);
              if (null == B[t]) {
                var o = (getComputedStyle(e, '') as any)['scroll-behavior'];
                B[t] = 'smooth' == o;
              }
              return B[t];
            })(dEl) &&
            ((dEl.$scrollBehavior = dEl.style.scrollBehavior),
            (dEl.style.scrollBehavior = 'auto'));

          var wFn = function () {
            for (var t = Date.now(), o = 0, nVal = 0, rIdx = 0; rIdx < b.length; rIdx++) {
              var aItem = b[rIdx],
                lVal = t - aItem.start,
                iVal = lVal >= p.animationTime,
                cVal = iVal ? 1 : lVal / p.animationTime;
              p.pulseAlgorithm && (cVal = F(cVal));
              var sVal = (aItem.x * cVal - aItem.lastX) >> 0,
                uVal = (aItem.y * cVal - aItem.lastY) >> 0;
              (o += sVal),
                (nVal += uVal),
                (aItem.lastX += sVal),
                (aItem.lastY += uVal),
                iVal && (b.splice(rIdx, 1), rIdx--);
            }
            hVal
              ? window.scrollBy(o, nVal)
              : (o && (dEl.scrollLeft += o), nVal && (dEl.scrollTop += nVal)),
              fVal || mVal || (b = []),
              b.length
                ? j(wFn, dEl, 1e3 / p.frameRate + 1)
                : ((g = !1),
                  null != dEl.$scrollBehavior &&
                    ((dEl.style.scrollBehavior = dEl.$scrollBehavior),
                    (dEl.$scrollBehavior = null)));
          };
          j(wFn, dEl, 0), (g = !0);
        }
      }

      function eHandler(e: any) {
        f || y();
        var t = e.target;
        if (e.defaultPrevented || e.ctrlKey) return !0;
        if (
          N(s, 'embed') ||
          (N(t, 'embed') && /\.pdf/i.test(t.src)) ||
          N(s, 'object') ||
          t.shadowRoot
        )
          return !0;
        var oVal = -e.wheelDeltaX || e.deltaX || 0,
          nVal = -e.wheelDeltaY || e.deltaY || 0;
        h &&
          (e.wheelDeltaX &&
            K(e.wheelDeltaX, 120) &&
            (oVal = (e.wheelDeltaX / Math.abs(e.wheelDeltaX)) * -120),
          e.wheelDeltaY &&
            K(e.wheelDeltaY, 120) &&
            (nVal = (e.wheelDeltaY / Math.abs(e.wheelDeltaY)) * -120)),
          oVal || nVal || (nVal = -e.wheelDelta || 0),
          1 === e.deltaMode && ((oVal *= 40), (nVal *= 40));
        var rVal = z(t);
        return rVal
          ? !!(function (e: any) {
              if (!e) return;
              l.length || (l = [e, e, e]);
              (e = Math.abs(e)),
                l.push(e),
                l.shift(),
                clearTimeout(a),
                (a = setTimeout(function () {
                  try {
                    localStorage.SS_deltaBuffer = l.join(',');
                  } catch (e) {}
                }, 1e3));
              var t = 120 < e && P(e),
                o = !P(120) && !P(100) && !t;
              return e < 50 || o;
            })(nVal) ||
              (1.2 < Math.abs(oVal) && (oVal *= p.stepSize / 120),
              1.2 < Math.abs(nVal) && (nVal *= p.stepSize / 120),
              S(rVal, oVal, nVal),
              e.preventDefault(),
              void C())
          : !d ||
              !W ||
              (Object.defineProperty(e, 'target', {
                value: window.frameElement,
              }),
              (parent as any).wheel(e));
      }

      function x(e: any) {
        var t = e.target,
          o =
            e.ctrlKey ||
            e.altKey ||
            e.metaKey ||
            (e.shiftKey && e.keyCode !== w.spacebar);
        document.body.contains(s) || (s = document.activeElement);
        var nPattern = /^(button|submit|radio|checkbox|file|color|image)$/i;
        if (
          e.defaultPrevented ||
          /^(textarea|select|embed|object)$/i.test(t.nodeName) ||
          (N(t, 'input') && !nPattern.test(t.type)) ||
          N(s, 'video') ||
          (function (e: any) {
            var t = e.target,
              o = !1;
            if (-1 != document.URL.indexOf('www.youtube.com/watch'))
              do {
                if ((o = t.classList && t.classList.contains('html5-video-controls')))
                  break;
              } while ((t = t.parentNode));
            return o;
          })(e) ||
          t.isContentEditable ||
          o
        )
          return !0;
        if (
          (N(t, 'button') || (N(t, 'input') && nPattern.test(t.type))) &&
          e.keyCode === w.spacebar
        )
          return !0;
        if (N(t, 'input') && 'radio' == t.type && v[e.keyCode]) return !0;
        var rVal = 0,
          aVal = 0,
          lVal = z(s);
        if (!lVal) return !d || !W || (parent as any).keydown(e);
        var iVal = lVal.clientHeight;
        switch ((lVal == document.body && (iVal = window.innerHeight), e.keyCode)) {
          case w.up:
            aVal = -p.arrowScroll;
            break;
          case w.down:
            aVal = p.arrowScroll;
            break;
          case w.spacebar:
            aVal = -(e.shiftKey ? 1 : -1) * iVal * 0.9;
            break;
          case w.pageup:
            aVal = 0.9 * -iVal;
            break;
          case w.pagedown:
            aVal = 0.9 * iVal;
            break;
          case w.home:
            lVal == document.body &&
              document.scrollingElement &&
              (lVal = document.scrollingElement),
              (aVal = -lVal.scrollTop);
            break;
          case w.end:
            var cVal = lVal.scrollHeight - lVal.scrollTop - iVal;
            aVal = 0 < cVal ? 10 + cVal : 0;
            break;
          case w.left:
            rVal = -p.arrowScroll;
            break;
          case w.right:
            rVal = p.arrowScroll;
            break;
          default:
            return !0;
        }
        S(lVal, rVal, aVal), e.preventDefault(), C();
      }

      function tHandler(e: any) {
        s = e.target;
      }

      var k: number,
        D: any,
        M =
          ((k = 0),
          function (e: any) {
            return e.uniqueID || (e.uniqueID = k++);
          }),
        E: Record<string, any> = {},
        T: Record<string, any> = {},
        B: Record<string, any> = {};

      function C() {
        clearInterval(D),
          (D = setInterval(function () {
            E = T = B = {};
          }, 1e3));
      }

      function H(eArr: any[], tVal: any, oVal?: boolean) {
        for (var nMap = oVal ? E : T, rIdx = eArr.length; rIdx--; )
          nMap[M(eArr[rIdx])] = tVal;
        return tVal;
      }

      function z(e: any): any {
        var tArr: any[] = [],
          oBody = document.body,
          nHeight = m.scrollHeight;
        do {
          var rVal = (!1 ? E : T)[M(e)];
          if (rVal) return H(tArr, rVal);
          if ((tArr.push(e), nHeight === e.scrollHeight)) {
            var aVal = (O(m) && O(oBody)) || X(m);
            if ((d && L(m)) || (!d && aVal)) return H(tArr, q());
          } else if (L(e) && X(e)) return H(tArr, e);
        } while ((e = e.parentElement));
      }

      function L(e: any) {
        return e.clientHeight + 10 < e.scrollHeight;
      }

      function O(e: any) {
        return 'hidden' !== getComputedStyle(e, '').getPropertyValue('overflow-y');
      }

      function X(e: any) {
        var t = getComputedStyle(e, '').getPropertyValue('overflow-y');
        return 'scroll' === t || 'auto' === t;
      }

      function Y(e: string, tFn: any, oOpt?: any) {
        window.addEventListener(e, tFn, oOpt || !1);
      }

      function A(e: string, tFn: any, oOpt?: any) {
        window.removeEventListener(e, tFn, oOpt || !1);
      }

      function N(e: any, tName: string) {
        return e && (e.nodeName || '').toLowerCase() === tName.toLowerCase();
      }

      if (window.localStorage && localStorage.SS_deltaBuffer)
        try {
          l = localStorage.SS_deltaBuffer.split(',');
        } catch (e) {}

      function K(e: number, t: number) {
        return Math.floor(e / t) == e / t;
      }

      function P(e: number) {
        return K(l[0], e) && K(l[1], e) && K(l[2], e);
      }

      var $: any,
        j: any =
          window.requestAnimationFrame ||
          (window as any).webkitRequestAnimationFrame ||
          (window as any).mozRequestAnimationFrame ||
          function (e: any, _t: any, o: any) {
            window.setTimeout(e, o || 1e3 / 60);
          },
        R =
          window.MutationObserver ||
          (window as any).WebKitMutationObserver ||
          (window as any).MozMutationObserver,
        q =
          (($ = document.scrollingElement),
          function () {
            if (!$) {
              var e = document.createElement('div');
              (e.style.cssText = 'height:10000px;width:1px;'),
                document.body.appendChild(e);
              var t = document.body.scrollTop;
              document.documentElement.scrollTop,
                window.scrollBy(0, 3),
                ($ =
                  document.body.scrollTop != t
                    ? document.body
                    : document.documentElement),
                window.scrollBy(0, -3),
                document.body.removeChild(e);
            }
            return $;
          });

      function V(e: number) {
        var t: number;
        return (
          ((e *= p.pulseScale) < 1
            ? e - (1 - Math.exp(-e))
            : ((e -= 1),
              (t = Math.exp(-1)) + (1 - Math.exp(-e)) * (1 - t))) *
          p.pulseNormalize
        );
      }

      function F(e: number) {
        return 1 <= e
          ? 1
          : e <= 0
          ? 0
          : (1 == p.pulseNormalize && (p.pulseNormalize /= V(1)), V(e));
      }

      var I = window.navigator.userAgent,
        _ = /Edge/.test(I),
        W = /chrome/i.test(I) && !_,
        U = /safari/i.test(I) && !_,
        G = /mobile/i.test(I),
        J = /Windows NT 6.1/i.test(I) && /rv:11/i.test(I),
        Q = U && (/Version\/8/i.test(I) || /Version\/9/i.test(I)),
        Z = (W || U || J) && !G,
        ee = !1;

      try {
        window.addEventListener(
          'test',
          null as any,
          Object.defineProperty({}, 'passive', {
            get: function () {
              ee = !0;
            },
          })
        );
      } catch (e) {}

      var te = !!ee && {
          passive: !1,
        },
        oe = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

      function ne(eOpts: any) {
        for (var tKey in eOpts)
          (o as any).hasOwnProperty(tKey) && ((p as any)[tKey] = eOpts[tKey]);
      }

      if (oe && Z) {
        Y(oe, eHandler, te);
        Y('mousedown', tHandler);
        Y('load', y);
      }

      destroyFn = function () {
        if (i && i.disconnect) i.disconnect();
        A(oe, eHandler);
        A('mousedown', tHandler);
        A('keydown', x);
        A('resize', c);
        A('load', y);
        clearInterval(D);
      };

      (window as any).SmoothScroll = ne;
      if ((window as any).SmoothScrollOptions) {
        ne((window as any).SmoothScrollOptions);
      }
    } catch (err) {
      console.warn('Smooth scroll initialization skipped:', err);
    }

    return () => {
      if (destroyFn) destroyFn();
    };
  }, []);

  return null;
}
