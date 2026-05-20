/**
 * collab.js — Card-06 collaborative editing demo. Fully self-contained.
 */

function initCollab() {
  var card = document.getElementById('card-06');
  if (!card) return;

  function cursorSvg(color) {
    return '<svg viewBox="0 0 24 24" fill="' + color + '" xmlns="http://www.w3.org/2000/svg"><path d="M5 3l14 8-6.5 1.5L11 19z"/></svg>';
  }

  var edits = [
    { el: document.getElementById('edit-title'),  words: ['Real-Time', 'Scalable', 'Event-Driven', 'Low-Latency'],                                                  color: '#ff6b6b', name: 'Sam'    },
    { el: document.getElementById('edit-desc1'),  words: ['high-concurrency platforms', 'distributed systems', 'streaming pipelines', 'resilient architectures'],   color: '#48d1cc', name: 'Jordan' },
  ];

  var running = false, loopActive = false;

  function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

  function posOf(span) {
    var cr = card.getBoundingClientRect(), sr = span.getBoundingClientRect();
    return { x: sr.right - cr.left, y: sr.bottom - cr.top };
  }

  function makeCursor(color, name) {
    var el = document.createElement('div');
    el.className = 'collab-cursor';
    el.innerHTML = cursorSvg(color) + '<span class="collab-cursor-tag" style="background:' + color + '">' + name + '</span>';
    el.style.opacity = '0';
    card.appendChild(el);
    return el;
  }

  function moveTo(cursor, x, y, ms) {
    return new Promise(function(r) {
      cursor.style.transition = 'transform ' + ms + 'ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 300ms ease';
      cursor.style.transform  = 'translate(' + x + 'px, ' + y + 'px)';
      setTimeout(r, ms);
    });
  }

  async function editSpan(edit) {
    if (!running) return;
    var el = edit.el, words = edit.words, color = edit.color, name = edit.name;
    var oldText = el.textContent;
    var pool    = words.filter(function(w) { return w !== oldText; });
    var newText = pool[Math.floor(Math.random() * pool.length)];
    var cursor  = makeCursor(color, name);

    cursor.style.transform = 'translate(-30px, ' + (posOf(el).y + 40) + 'px)';
    await sleep(200);
    cursor.style.opacity = '1';
    var pos = posOf(el);
    await moveTo(cursor, pos.x, pos.y, 1600);
    if (!running) { cursor.remove(); return; }

    el.classList.add('collab-select');
    await sleep(1200);
    if (!running) { cursor.remove(); el.classList.remove('collab-select'); return; }

    cursor.style.opacity = '0';
    el.classList.add('collab-caret');
    el.style.borderColor = color;

    for (var i = oldText.length - 1; i >= 0; i--) {
      if (!running) break;
      el.textContent = oldText.slice(0, i);
      pos = posOf(el);
      cursor.style.transition = 'transform 80ms linear';
      cursor.style.transform  = 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
      await sleep(100);
    }
    el.textContent = '';

    for (var j = 1; j <= newText.length; j++) {
      if (!running) break;
      el.textContent = newText.slice(0, j);
      pos = posOf(el);
      cursor.style.transition = 'transform 80ms linear';
      cursor.style.transform  = 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
      await sleep(120);
    }

    el.classList.remove('collab-select', 'collab-caret');
    el.style.borderColor = '';
    await sleep(500);
    cursor.remove();
  }

  async function dragSelect() {
    if (!running) return;
    var cursor = makeCursor('#0d47a1', 'Alex');
    var cardW = card.offsetWidth, cardH = card.offsetHeight;
    var x1 = cardW * 0.5 + Math.random() * cardW * 0.2;
    var y1 = cardH * 0.2 + Math.random() * cardH * 0.3;
    var x2 = x1 + 60 + Math.random() * 80;
    var y2 = y1 + 40 + Math.random() * 50;

    cursor.style.transform = 'translate(' + (cardW + 30) + 'px, ' + (y1 + 20) + 'px)';
    await sleep(100);
    cursor.style.opacity = '1';
    await moveTo(cursor, x1, y1, 1200);
    if (!running) { cursor.remove(); return; }
    await sleep(300);

    var rect = document.createElement('div');
    rect.className = 'collab-drag-rect';
    rect.style.borderColor = '#0d47a1';
    rect.style.background  = 'rgba(13, 71, 161, 0.06)';
    rect.style.opacity     = '0.8';
    card.appendChild(rect);

    var steps = 30;
    for (var s = 0; s <= steps; s++) {
      if (!running) break;
      var t = s / steps, ease = t * t * (3 - 2 * t);
      var cx = x1 + (x2 - x1) * ease, cy = y1 + (y2 - y1) * ease;
      cursor.style.transition = 'transform 40ms linear';
      cursor.style.transform  = 'translate(' + cx + 'px, ' + cy + 'px)';
      rect.style.transform    = 'translate(' + x1 + 'px, ' + y1 + 'px)';
      rect.style.width        = (cx - x1) + 'px';
      rect.style.height       = (cy - y1) + 'px';
      await sleep(50);
    }

    await sleep(800);
    cursor.style.opacity = '0';
    rect.style.opacity   = '0';
    await sleep(500);
    cursor.remove();
    rect.remove();
  }

  async function playLoop() {
    if (loopActive) return;
    loopActive = true;
    await sleep(1500);
    if (!running) { loopActive = false; return; }
    await Promise.all([
      editSpan(edits[0]),
      sleep(1000).then(function() { return editSpan(edits[1]); }),
      sleep(1500).then(function() { return dragSelect(); }),
    ]);
    loopActive = false;
    if (running) {
      await sleep(15000);
      if (running) playLoop();
    }
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !running) { running = true; playLoop(); }
      else if (!entry.isIntersecting)       { running = false; }
    });
  }, { threshold: 0.3 });

  observer.observe(card);
}
