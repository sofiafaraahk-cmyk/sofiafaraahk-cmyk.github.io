(function () {
  var de = document.documentElement,
    leaving = false;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dir = "in";
  try {
    dir = sessionStorage.getItem("dir") || "in";
    sessionStorage.removeItem("dir");
  } catch (e) {}
  de.dataset.enter = dir;
  setTimeout(function () {
    delete de.dataset.enter;
  }, 900);

  function go(url, d) {
    if (leaving || !url) return;
    leaving = true;
    try {
      sessionStorage.setItem("dir", d);
    } catch (e) {}
    de.dataset.go = d;
    de.classList.add("leaving");
    setTimeout(
      function () {
        location.href = url;
      },
      reduce ? 0 : 420
    );
  }

  addEventListener("pageshow", function (e) {
    if (e.persisted) {
      leaving = false;
      de.classList.remove("leaving");
    }
  });

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (
      !a ||
      e.defaultPrevented ||
      e.button ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      a.target === "_blank" ||
      a.protocol !== location.protocol ||
      a.host !== location.host ||
      a.getAttribute("href").charAt(0) === "#"
    )
      return;
    e.preventDefault();
    go(a.href, a.dataset.dir || "next");
  });

  var seen = {};
  ["pointerenter", "touchstart", "focusin"].forEach(function (ev) {
    document.addEventListener(
      ev,
      function (e) {
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a || seen[a.href] || a.host !== location.host) return;
        seen[a.href] = 1;
        var l = document.createElement("link");
        l.rel = "prefetch";
        l.href = a.href;
        document.head.appendChild(l);
      },
      true
    );
  });

  addEventListener("keydown", function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var t = { ArrowRight: ["next", "next"], ArrowLeft: ["prev", "prev"], Escape: ["up", "out"] }[e.key],
      b = document.body.dataset;
    if (t && b[t[0]]) go(b[t[0]], t[1]);
  });

  var sx, sy;
  addEventListener(
    "touchstart",
    function (e) {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    },
    { passive: true }
  );
  addEventListener(
    "touchend",
    function (e) {
      var dx = e.changedTouches[0].clientX - sx,
        dy = e.changedTouches[0].clientY - sy,
        b = document.body.dataset;
      if (Math.abs(dx) > 90 && Math.abs(dy) < 50) {
        var k = dx < 0 ? "next" : "prev";
        if (b[k]) go(b[k], k);
      }
    },
    { passive: true }
  );

  document.addEventListener("DOMContentLoaded", function () {
    function hot(el, on) {
      document.querySelectorAll('[data-item="' + el.dataset.item + '"]').forEach(function (x) {
        x.classList.toggle("hot", on);
      });
    }
    document.querySelectorAll("[data-item]").forEach(function (el) {
      [
        ["pointerenter", 1],
        ["focus", 1],
        ["pointerleave", 0],
        ["blur", 0]
      ].forEach(function (p) {
        el.addEventListener(p[0], function () {
          hot(el, p[1]);
        });
      });
    });

    var room = document.querySelector(".room"),
      raf = 0;
    if (room && !reduce) {
      room.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse" || raf) return;
        var r = room.getBoundingClientRect(),
          x = ((e.clientX - r.left) / r.width) * 2 - 1,
          y = ((e.clientY - r.top) / r.height) * 2 - 1;
        raf = requestAnimationFrame(function () {
          raf = 0;
          room.style.setProperty("--lx", x.toFixed(3));
          room.style.setProperty("--ly", y.toFixed(3));
        });
      });
      room.addEventListener("pointerleave", function () {
        room.style.setProperty("--lx", 0);
        room.style.setProperty("--ly", 0);
      });
    }
  });
})();