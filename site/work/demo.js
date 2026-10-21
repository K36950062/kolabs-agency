/* KOLABS demo sites: shared behaviour.
   - [data-menu-toggle]  opens and closes the phone menu
   - [data-tabs]         accessible tabs
   - [data-book]         day + time booking picker (nothing is really booked)
   - [data-gallery]      photo viewer
   - form[data-demo-form] shows a "sent" message instead of sending
   - adds a floating "Back to KOLABS" button to every demo */
(function () {
  'use strict';
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* ---------- message dialog ---------- */
  var dlg;
  function say(title, lines) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'demo-dialog';
      dlg.setAttribute('aria-labelledby', 'demo-dialog-title');
      document.body.appendChild(dlg);
    }
    dlg.innerHTML = '';
    var h = document.createElement('h2'); h.id = 'demo-dialog-title'; h.textContent = title; dlg.appendChild(h);
    lines.forEach(function (t) { var p = document.createElement('p'); p.textContent = t; dlg.appendChild(p); });
    var note = document.createElement('p'); note.className = 'demo-note';
    note.textContent = 'This is a demo website, so nothing was actually sent.'; dlg.appendChild(note);
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Close';
    b.addEventListener('click', function () { dlg.close(); }); dlg.appendChild(b);
    dlg.showModal(); b.focus();
  }
  window.demoSay = say;

  /* ---------- floating way back to the KOLABS site ---------- */
  var back = document.createElement('a');
  back.className = 'kolabs-back';
  back.href = '../../#work';
  back.innerHTML = '<svg width="18" height="18" viewBox="0 0 30 30" aria-hidden="true"><rect x="1" y="1" width="18" height="18" rx="3" fill="#1A3CFF"/><rect x="11" y="11" width="18" height="18" rx="3" fill="none" stroke="#fff" stroke-width="2.5"/></svg>' +
    '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '<span>Back to KOLABS</span>';
  back.setAttribute('aria-label', 'Back to the KOLABS Agency website');
  document.body.appendChild(back);

  /* ---------- phone menu ---------- */
  document.querySelectorAll('[data-menu-toggle]').forEach(function (btn) {
    var nav = document.getElementById(btn.getAttribute('aria-controls'));
    if (!nav) return;
    function set(open) { btn.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  });

  /* ---------- tabs ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    function pick(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      box.dispatchEvent(new CustomEvent('tabchange', { detail: tab }));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); pick(n, true); }
      });
    });
    pick(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
  });

  /* ---------- booking picker ---------- */
  function fmtDay(d) { return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  document.querySelectorAll('[data-book]').forEach(function (box, boxIndex) {
    var count = parseInt(box.getAttribute('data-days') || '7', 10);
    var closed = (box.getAttribute('data-closed') || '').split(',').filter(Boolean).map(Number);
    var times = (box.getAttribute('data-times') || '09:00,10:00,11:00,12:00,14:00,15:00,16:00').split(',');
    var daysEl = box.querySelector('[data-days-list]');
    var timesEl = box.querySelector('[data-times-list]');
    var sumEl = box.querySelector('[data-summary]');
    var go = box.querySelector('[data-confirm]');
    var title = box.getAttribute('data-title') || 'Booking requested';
    var chosenDay = null, chosenTime = null;

    var d = new Date(); d.setHours(12, 0, 0, 0);
    var dates = [];
    while (dates.length < count) {
      d.setDate(d.getDate() + 1);
      if (closed.indexOf(d.getDay()) === -1) dates.push(new Date(d));
    }

    function choices() {
      var out = [];
      box.querySelectorAll('input[type="radio"]:checked, select').forEach(function (el) {
        if (el.tagName === 'SELECT') out.push(el.options[el.selectedIndex].text);
        else {
          var lab = box.querySelector('label[for="' + el.id + '"]') || el.closest('label');
          out.push(el.getAttribute('data-label') || (lab ? lab.textContent.trim() : el.value));
        }
      });
      return out;
    }
    function summary() {
      var parts = choices();
      if (chosenDay) parts.push(fmtDay(chosenDay));
      if (chosenTime) parts.push('at ' + chosenTime);
      if (!chosenDay) sumEl.textContent = 'Pick a day to see free times.';
      else if (!chosenTime) sumEl.textContent = 'Now pick a time on ' + fmtDay(chosenDay) + '.';
      else sumEl.textContent = parts.join(', ').replace(', at', ' at');
      go.disabled = !(chosenDay && chosenTime);
    }
    function taken(di, ti) { return (di * 7 + ti * 3 + boxIndex * 11 + 2) % 5 === 0; }
    function drawTimes(di) {
      timesEl.innerHTML = '';
      chosenTime = null;
      times.forEach(function (t, ti) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', 'false');
        if (taken(di, ti)) { b.disabled = true; b.className = 'is-taken'; b.setAttribute('aria-label', t + ', already booked'); }
        b.addEventListener('click', function () {
          timesEl.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true'); chosenTime = t; summary();
        });
        timesEl.appendChild(b);
      });
    }
    dates.forEach(function (date, di) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', fmtDay(date));
      b.innerHTML = '<span>' + DAYS[date.getDay()] + '</span><b>' + date.getDate() + '</b>';
      b.addEventListener('click', function () {
        daysEl.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true'); chosenDay = date; drawTimes(di); summary();
      });
      daysEl.appendChild(b);
    });
    timesEl.innerHTML = '<p class="bk-empty">Pick a day first.</p>';
    box.addEventListener('change', summary);
    go.addEventListener('click', function () { say(title, [sumEl.textContent]); });
    summary();
  });

  /* ---------- photo viewer ---------- */
  document.querySelectorAll('[data-gallery]').forEach(function (gal) {
    var links = Array.prototype.slice.call(gal.querySelectorAll('a'));
    if (!links.length) return;
    var lb = document.createElement('dialog');
    lb.className = 'lb'; lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-btn lb-close" aria-label="Close photo">&times;</button>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">&#8249;</button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), at = 0;
    function show(i) {
      at = (i + links.length) % links.length;
      var a = links[at], th = a.querySelector('img');
      img.src = a.href; img.alt = th ? th.alt : '';
      cap.textContent = a.getAttribute('data-caption') || '';
    }
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); show(i); lb.showModal(); lb.querySelector('.lb-close').focus(); });
    });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(at - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(at + 1); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { links[at].focus(); });
  });

  /* ---------- demo forms ---------- */
  document.querySelectorAll('form[data-demo-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      say(f.getAttribute('data-title') || 'Message sent', [f.getAttribute('data-thanks') || "Thanks, we'll get back to you soon."]);
      f.reset();
    });
  });
})();
