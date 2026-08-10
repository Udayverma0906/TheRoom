// ============================================================
// movies.js — step 2: pick a movie from the catalog.
// ============================================================

import { movies } from "./movies-data.js";
import { getBooking, updateBooking } from "./state.js";
import { renderProgress, guardStep } from "./nav.js";

let currentMovieId = "";
let currentIndex = 0;

function initMoviesPage() {
  if (!guardStep(["guest"])) return;
  renderProgress("movies");

  const booking = getBooking();
  greetGuest(booking.guest.name);
  currentMovieId = booking.movie.id || movies[0].id;
  currentIndex = movies.findIndex((m) => m.id === currentMovieId);
  renderMovieGrid(booking.movie.id);
  wireMovieModal();
  hydrateShowtime(booking);
  initShowtimePicker();
}

function greetGuest(name) {
  const el = document.querySelector("[data-greeting]");
  if (el && name) {
    el.textContent = `Welcome, ${name.split(" ")[0]}. Your cinema awaits.`;
  }
}

function hydrateShowtime(booking) {
  const datetime = document.querySelector("[data-showtime-datetime]");
  if (!datetime) return;
  const scheduledAt = booking.movie?.scheduledAt || "";
  datetime.value = scheduledAt;
}

/* Custom calendar / time picker for themed UX */
function initShowtimePicker() {
  const input = document.querySelector("[data-showtime-datetime]");
  const picker = document.querySelector("[data-showtime-picker]");
  if (!input || !picker) return;

  // ensure hidden at startup (markup uses hidden attribute but CSS may override)
  picker.hidden = true;

  const grid = picker.querySelector("[data-cal-grid]");
  const titleEl = picker.querySelector("[data-cal-title]");
  const timesEl = picker.querySelector("[data-cal-times]");
  const prevBtn = picker.querySelector(".cal-prev");
  const nextBtn = picker.querySelector(".cal-next");

  let view = new Date();
  view.setDate(1);

  function pad(n){return n<10? '0'+n : ''+n}
  function localIso(dt){
    const y=dt.getFullYear(), m=pad(dt.getMonth()+1), d=pad(dt.getDate()), hh=pad(dt.getHours()), mm=pad(dt.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }

  function isSameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}

  function clearChildren(el){ while(el.firstChild) el.removeChild(el.firstChild); }

  function renderCalendar() {
    clearChildren(grid);
    const year = view.getFullYear();
    const month = view.getMonth();
    titleEl.textContent = view.toLocaleString(undefined,{month:'long', year:'numeric'});

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    // produce empty slots then days
    for(let i=0;i<firstDay;i++){
      const el = document.createElement('div'); el.className='calendar-day empty'; grid.appendChild(el);
    }
    const today = new Date(); today.setHours(0,0,0,0);
    const selected = input._tempDate instanceof Date ? input._tempDate : (input._selectedDate ? new Date(input._selectedDate) : null);

    for(let d=1; d<=daysInMonth; d++){
      const dt = new Date(year, month, d);
      const el = document.createElement('button'); el.type='button'; el.className='calendar-day';
      el.textContent = d;
      el.dataset.date = dt.toISOString();
      if(dt < today){ el.classList.add('disabled'); }
      if(selected && isSameDay(dt, selected)) el.classList.add('selected');
      if(!el.classList.contains('disabled')){
        el.addEventListener('click', ()=>{
          // set temp date (preserve existing time if present)
          const existing = input._tempDate || (input._selectedDate ? new Date(input._selectedDate) : null);
          const tmp = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), existing ? existing.getHours() : 18, existing ? existing.getMinutes() : 0,0,0);
          input._tempDate = tmp;
          renderCalendar();
          renderTimes();
        });
      }
      grid.appendChild(el);
    }
  }

  function formatTimeForInput(date){
    const hh = date.getHours();
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const hour12 = ((hh + 11) % 12) + 1;
    return `${hour12}:${mm}${date.getSeconds() ? `:${ss}` : ''} ${ampm}`;
  }

  function parseTimeText(value){
    const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/);
    if(!match) return null;
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const second = match[3] ? parseInt(match[3], 10) : 0;
    const ampm = match[4].toUpperCase();
    if(hour < 1 || hour > 12 || minute > 59 || second > 59) return null;
    if(ampm === 'PM' && hour !== 12) hour += 12;
    if(ampm === 'AM' && hour === 12) hour = 0;
    return { hour, minute, second };
  }

  function renderTimes(){
    clearChildren(timesEl);
    const selectedDate = input._tempDate ? new Date(input._tempDate) : (input._selectedDate ? new Date(input._selectedDate) : null);
    const wrapper = document.createElement('div'); wrapper.className='calendar-time-wrapper';
    const label = document.createElement('label'); label.className='calendar-time-label'; label.htmlFor='calendar-time-input'; label.textContent='Showtime';
    const field = document.createElement('input');
    field.id = 'calendar-time-input';
    field.type = 'text';
    field.className = 'calendar-time-input';
    field.placeholder = '07:30 PM';
    field.autocomplete = 'off';
    field.inputMode = 'text';
    const hint = document.createElement('p'); hint.className='calendar-time-hint';

    wrapper.append(label, field, hint);
    timesEl.appendChild(wrapper);

    if(!selectedDate){
      field.disabled = true;
      field.value = '';
      hint.textContent = 'Pick a date first to enter a time.';
      return;
    }

    field.disabled = false;
    field.value = formatTimeForInput(selectedDate);
    hint.textContent = 'Enter time as HH:MM AM or HH:MM:SS PM.';

    field.addEventListener('input', ()=>{
      const parsed = parseTimeText(field.value);
      if(!parsed){
        field.classList.add('invalid');
        hint.textContent = 'Use format 07:30 PM or 07:30:00 PM.';
        return;
      }
      field.classList.remove('invalid');
      hint.textContent = 'Press OK when time is correct.';
      const updated = new Date(selectedDate);
      updated.setHours(parsed.hour, parsed.minute, parsed.second, 0);
      input._tempDate = updated;
    });
  }

  prevBtn.addEventListener('click', ()=>{ view.setMonth(view.getMonth()-1); renderCalendar(); });
  nextBtn.addEventListener('click', ()=>{ view.setMonth(view.getMonth()+1); renderCalendar(); });

  const okBtn = picker.querySelector('.cal-ok');
  const cancelBtn = picker.querySelector('.cal-cancel');

  function positionPicker() {
    // measure and position relative to input, use fixed so it stays on top during scroll
    picker.classList.add('fixed');
    const maxWidth = Math.min(520, window.innerWidth - 40);
    picker.style.width = maxWidth + 'px';
    const rect = input.getBoundingClientRect();

    if(window.innerWidth <= 840){
      picker.style.left = '12px';
      picker.style.right = '12px';
      picker.style.top = '12px';
      picker.style.width = Math.min(window.innerWidth - 24, 520) + 'px';
      return;
    }

    picker.style.left = Math.max(12, rect.left) + 'px';
    // compute desired top below input
    picker.style.top = (rect.bottom + 8) + 'px';
    // ensure it fits vertically; if not, place above
    const ph = picker.offsetHeight || 320;
    let top = rect.bottom + 8;
    if(top + ph > window.innerHeight - 12){
      top = rect.top - ph - 8;
      if(top < 8) top = 8;
    }
    picker.style.top = top + 'px';
    // clamp left inside viewport
    const pw = picker.offsetWidth;
    let left = rect.left;
    if(left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
    if(left < 12) left = 12;
    picker.style.left = left + 'px';
  }

  // open picker on input click — set temp selection state and position it
  function setPickerVisible(show){
    picker.hidden = !show;
    if(show){
      document.body.classList.add('no-scroll-picker');
      // initialize temp selection from existing scheduledAt or clear
      const booking = getBooking();
      if(booking.movie?.scheduledAt){
        const v = booking.movie.scheduledAt;
        const parsed = new Date(v);
        if(!Number.isNaN(parsed.getTime())) input._tempDate = parsed;
        else input._tempDate = null;
      } else {
        input._tempDate = null;
      }
      renderCalendar(); renderTimes();
      requestAnimationFrame(()=> positionPicker());
    } else {
      document.body.classList.remove('no-scroll-picker');
    }
  }

  // NOTE: pass `picker.hidden` (not `!picker.hidden`) — picker.hidden===true
  // means "currently closed", and that's exactly when a click should open it.
  input.addEventListener('click', (e)=>{ setPickerVisible(picker.hidden); });

  // close when clicking outside
  // NOTE: uses composedPath(), not picker.contains(ev.target) — a day click
  // triggers renderCalendar(), which rebuilds the whole grid (including the
  // button just clicked) *before* this event finishes bubbling to document.
  // By then ev.target is a detached node, so picker.contains(ev.target) is
  // always false — the picker was closing itself immediately after every
  // date selection. composedPath() is captured at dispatch time, so it still
  // correctly reports the click happened inside the picker.
  document.addEventListener('click', (ev)=>{
    if(!picker.hidden){
      const path = typeof ev.composedPath === 'function' ? ev.composedPath() : [];
      const clickedInsidePicker = path.includes(picker) || path.includes(input);
      if(!clickedInsidePicker){ setPickerVisible(false); }
    }
  });

  // close on escape
  document.addEventListener('keydown', (ev)=>{
    if(ev.key === 'Escape' && !picker.hidden){ setPickerVisible(false); }
  });

  // close on resize and reposition appropriately
  window.addEventListener('resize', ()=>{
    if(!picker.hidden){
      // reposition if visible
      try{ positionPicker(); }catch(e){ setPickerVisible(false); }
    }
  });
  // reposition on scroll so picker stays near input
  window.addEventListener('scroll', ()=>{ if(!picker.hidden) positionPicker(); }, {passive:true});

  // OK / Cancel behavior
  okBtn?.addEventListener('click', ()=>{
    if(!input._tempDate) return; // nothing to confirm
    input.value = localIso(input._tempDate);
    const currentBooking = getBooking();
    updateBooking({ movie: { ...currentBooking.movie, scheduledAt: input.value } });
    // persist selected
    input._selectedDate = input._tempDate.toISOString();
    setPickerVisible(false);
  });
  cancelBtn?.addEventListener('click', ()=>{
    // discard temp and restore display from booking
    const booking = getBooking();
    if(booking.movie?.scheduledAt) input.value = booking.movie.scheduledAt;
    else input.value = '';
    input._tempDate = null;
    setPickerVisible(false);
  });

  // if there's an existing scheduledAt, show it in input
  const booking = getBooking();
  if(booking.movie?.scheduledAt){ input.value = booking.movie.scheduledAt; }
}

function renderMovieGrid(selectedId) {
  const grid = document.querySelector("[data-movie-grid]");
  if (!grid) return;

  grid.innerHTML = movies
    .map(
      (m) => `
      <div class="movie-card${m.id === selectedId ? " selected" : ""}" data-movie-id="${m.id}">
        <div class="check">✓</div>
        <img class="poster" src="${m.poster}" alt="${m.title} poster" loading="lazy" />
        <div class="info">
          <div class="title">${m.title}</div>
          <div class="tags">
            <span class="tag">${m.genre}</span>
            <span class="tag">${m.duration}</span>
            <span class="tag rating">★ ${m.rating}</span>
          </div>
          <div class="desc">${m.description}</div>
          <div class="select-btn">View details →</div>
        </div>
      </div>`
    )
    .join("");

  grid.querySelectorAll(".movie-card").forEach((card) => {
    card.addEventListener("click", () => openMovieModal(card.dataset.movieId));
  });
}

function wireMovieModal() {
  const overlay = document.querySelector("[data-movie-modal]");
  const panel = document.querySelector("[data-movie-modal-panel]");
  const glow = document.querySelector("[data-movie-modal-glow]");
  const poster = document.querySelector("[data-movie-modal-poster]");
  const title = document.querySelector("[data-movie-modal-title]");
  const genre = document.querySelector("[data-movie-modal-genre]");
  const tagline = document.querySelector("[data-movie-modal-tagline]");
  const description = document.querySelector("[data-movie-modal-description]");
  const duration = document.querySelector("[data-movie-modal-duration]");
  const rating = document.querySelector("[data-movie-modal-rating]");
  const trailer = document.querySelector("[data-movie-modal-trailer]");
  const highlight = document.querySelector("[data-movie-modal-highlight]");
  const gif = document.querySelector("[data-movie-modal-gif]");
  const closeBtn = document.querySelector("[data-movie-close]");
  const confirmBtn = document.querySelector("[data-movie-confirm]");
  const prevBtn = document.querySelector("[data-movie-prev]");
  const nextBtn = document.querySelector("[data-movie-next]");

  if (!overlay || !panel) return;

  const updateModal = (movie) => {
    if (!movie) return;
    currentMovieId = movie.id;
    currentIndex = movies.findIndex((m) => m.id === movie.id);
    poster.src = movie.poster;
    poster.alt = `${movie.title} poster`;
    title.textContent = movie.title;
    genre.textContent = `${movie.genre} · ${movie.duration}`;
    tagline.textContent = movie.tagline || "";
    description.textContent = movie.description;
    duration.textContent = `⏱ ${movie.duration}`;
    rating.textContent = `⭐ ${movie.rating}`;
    trailer.src = movie.trailer || "";
    highlight.textContent = movie.highlight || "";
    gif.src = movie.gif || "";
    gif.hidden = !movie.gif;
    glow.style.background = `radial-gradient(circle, ${movie.themeSoft || "rgba(255,255,255,0.16)"} 0%, transparent 70%)`;
    panel.style.setProperty("--modal-accent", movie.themeColor || "#42c7c3");
    document.documentElement.style.setProperty("--modal-accent", movie.themeColor || "#42c7c3");
    document.documentElement.style.setProperty("--page-accent", movie.themeColor || "#42c7c3");
    document.documentElement.style.setProperty("--page-accent-soft", movie.themeSoft || "rgba(66,199,195,0.16)");
  };

  function openModal(movieId) {
    const movie = movies.find((m) => m.id === movieId);
    if (!movie) return;
    updateModal(movie);
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("show"));
  }

  function closeModal() {
    overlay.classList.remove("show");
    setTimeout(() => {
      overlay.hidden = true;
    }, 220);
  }

  prevBtn?.addEventListener("click", () => {
    const prevMovie = movies[(currentIndex - 1 + movies.length) % movies.length];
    updateModal(prevMovie);
  });

  nextBtn?.addEventListener("click", () => {
    const nextMovie = movies[(currentIndex + 1) % movies.length];
    updateModal(nextMovie);
  });

  closeBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) closeModal();
  });
  confirmBtn?.addEventListener("click", () => {
    handleSelect(currentMovieId);
    closeModal();
  });

  window.openMovieModal = openModal;
}

function openMovieModal(movieId) {
  if (typeof window.openMovieModal === "function") {
    window.openMovieModal(movieId);
  }
}

function handleSelect(movieId) {
  const movie = movies.find((m) => m.id === movieId);
  if (!movie) return;

  document.querySelectorAll(".movie-card").forEach((c) => {
    c.classList.toggle("selected", c.dataset.movieId === movieId);
  });

  updateBooking({
    movie: {
      id: movie.id,
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      rating: movie.rating,
      poster: movie.poster,
      showtime: document.querySelector("[data-showtime-datetime]")?.value ? 'scheduled' : '',
      scheduledAt: document.querySelector("[data-showtime-datetime]")?.value || "",
      gif: movie.gif || "",
      themeColor: movie.themeColor || "",
      themeSoft: movie.themeSoft || "",
    },
  });

  showConfirmFlash(movie);
}

function showConfirmFlash(movie) {
  const flash = document.querySelector("[data-confirm-flash]");
  if (!flash) {
    window.location.href = "seats.html";
    return;
  }
  flash.querySelector("[data-flash-title]").textContent = movie.title;
  flash.classList.add("show");

  setTimeout(() => {
    window.location.href = "seats.html";
  }, 1000);
}

export { initMoviesPage };