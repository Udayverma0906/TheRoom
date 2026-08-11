// ============================================================
// movies.js — step 2: search movies via TMDB.
// ============================================================

import { getBooking, updateBooking } from "./state.js";
import { renderProgress, guardStep } from "./nav.js";
import { showToast } from "./toast.js";

const TMDB_API_KEY = "1d11a9b7a61aec12421b4a8d336ed94d";
const TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie";

let currentMovieId = "";
let selectedMovie = null;
let tmdbSearchResults = [];

function initMoviesPage() {
  if (!guardStep(["guest"])) return;
  renderProgress("movies");

  const booking = getBooking();
  greetGuest(booking.guest.name);
  selectedMovie = booking.movie?.id ? booking.movie : null;

  wireMovieSearch();
  hydrateShowtime(booking);
  initShowtimePicker();
  wireContinueButton();
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

/* ============================================================
   SHOWTIME VALIDATION
   ============================================================ */

function validateShowtime() {
  const datetimeInput = document.querySelector("[data-showtime-datetime]");

  if (!datetimeInput || !datetimeInput.value) {
    datetimeInput?.classList.add("invalid");
    datetimeInput?.focus();

    showToast(
      "Please choose a date and time before continuing.",
      "danger"
    );

    return false;
  }

  const parsedDate = new Date(datetimeInput.value);

  if (Number.isNaN(parsedDate.getTime())) {
    datetimeInput.classList.add("invalid");
    datetimeInput.focus();

    showToast(
      "Please choose a valid date and time before continuing.",
      "danger"
    );

    return false;
  }

  datetimeInput.classList.remove("invalid");

  return true;
}

/* ============================================================
   CUSTOM CALENDAR / TIME PICKER
   ============================================================ */

function initShowtimePicker() {
  const input = document.querySelector("[data-showtime-datetime]");
  const picker = document.querySelector("[data-showtime-picker]");

  if (!input || !picker) return;

  // Ensure hidden at startup
  picker.hidden = true;

  const grid = picker.querySelector("[data-cal-grid]");
  const titleEl = picker.querySelector("[data-cal-title]");
  const timesEl = picker.querySelector("[data-cal-times]");
  const prevBtn = picker.querySelector(".cal-prev");
  const nextBtn = picker.querySelector(".cal-next");

  let view = new Date();
  view.setDate(1);

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function localIso(dt) {
    const y = dt.getFullYear();
    const m = pad(dt.getMonth() + 1);
    const d = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const mm = pad(dt.getMinutes());

    return `${y}-${m}-${d}T${hh}:${mm}`;
  }

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function clearChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function renderCalendar() {
    clearChildren(grid);

    const year = view.getFullYear();
    const month = view.getMonth();

    titleEl.textContent = view.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Produce empty slots then days
    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement("div");
      el.className = "calendar-day empty";
      grid.appendChild(el);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected =
      input._tempDate instanceof Date
        ? input._tempDate
        : input._selectedDate
          ? new Date(input._selectedDate)
          : null;

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);

      const el = document.createElement("button");
      el.type = "button";
      el.className = "calendar-day";
      el.textContent = d;
      el.dataset.date = dt.toISOString();

      if (dt < today) {
        el.classList.add("disabled");
      }

      if (selected && isSameDay(dt, selected)) {
        el.classList.add("selected");
      }

      if (!el.classList.contains("disabled")) {
        el.addEventListener("click", () => {
          // Set temporary date
          // Preserve existing time if present
          const existing =
            input._tempDate ||
            (input._selectedDate ? new Date(input._selectedDate) : null);

          const tmp = new Date(
            dt.getFullYear(),
            dt.getMonth(),
            dt.getDate(),
            existing ? existing.getHours() : 18,
            existing ? existing.getMinutes() : 0,
            0,
            0
          );

          input._tempDate = tmp;

          renderCalendar();
          renderTimes();
        });
      }

      grid.appendChild(el);
    }
  }

  function formatTimeForInput(date) {
    const hh = date.getHours();
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = ((hh + 11) % 12) + 1;

    return `${hour12}:${mm}${date.getSeconds() ? `:${ss}` : ""} ${ampm}`;
  }

  function parseTimeText(value) {
    const match = value
      .trim()
      .match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/);

    if (!match) return null;

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const second = match[3] ? parseInt(match[3], 10) : 0;
    const ampm = match[4].toUpperCase();

    if (
      hour < 1 ||
      hour > 12 ||
      minute > 59 ||
      second > 59
    ) {
      return null;
    }

    if (ampm === "PM" && hour !== 12) {
      hour += 12;
    }

    if (ampm === "AM" && hour === 12) {
      hour = 0;
    }

    return {
      hour,
      minute,
      second,
    };
  }

  function renderTimes() {
    clearChildren(timesEl);

    const selectedDate = input._tempDate
      ? new Date(input._tempDate)
      : input._selectedDate
        ? new Date(input._selectedDate)
        : null;

    const wrapper = document.createElement("div");
    wrapper.className = "calendar-time-wrapper";

    const label = document.createElement("label");
    label.className = "calendar-time-label";
    label.htmlFor = "calendar-time-input";
    label.textContent = "Showtime";

    const field = document.createElement("input");
    field.id = "calendar-time-input";
    field.type = "text";
    field.className = "calendar-time-input";
    field.placeholder = "07:30 PM";
    field.autocomplete = "off";
    field.inputMode = "text";

    const hint = document.createElement("p");
    hint.className = "calendar-time-hint";

    wrapper.append(label, field, hint);
    timesEl.appendChild(wrapper);

    if (!selectedDate) {
      field.disabled = true;
      field.value = "";
      hint.textContent = "Pick a date first to enter a time.";
      return;
    }

    field.disabled = false;
    field.value = formatTimeForInput(selectedDate);

    hint.textContent =
      "Enter time as HH:MM AM or HH:MM:SS PM.";

    field.addEventListener("input", () => {
      const parsed = parseTimeText(field.value);

      if (!parsed) {
        field.classList.add("invalid");
        hint.textContent =
          "Use format 07:30 PM or 07:30:00 PM.";
        return;
      }

      field.classList.remove("invalid");

      hint.textContent =
        "Press OK when time is correct.";

      const updated = new Date(selectedDate);

      updated.setHours(
        parsed.hour,
        parsed.minute,
        parsed.second,
        0
      );

      input._tempDate = updated;
    });
  }

  prevBtn.addEventListener("click", () => {
    view.setMonth(view.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    view.setMonth(view.getMonth() + 1);
    renderCalendar();
  });

  const okBtn = picker.querySelector(".cal-ok");
  const cancelBtn = picker.querySelector(".cal-cancel");

  function positionPicker() {
    picker.classList.add("fixed");

    const maxWidth = Math.min(
      520,
      window.innerWidth - 40
    );

    picker.style.width = maxWidth + "px";

    const rect = input.getBoundingClientRect();

    if (window.innerWidth <= 840) {
      picker.style.left = "12px";
      picker.style.right = "12px";
      picker.style.top = "12px";
      picker.style.width =
        Math.min(window.innerWidth - 24, 520) + "px";

      return;
    }

    picker.style.left =
      Math.max(12, rect.left) + "px";

    // Compute desired top below input
    picker.style.top =
      rect.bottom + 8 + "px";

    // Ensure it fits vertically
    const ph = picker.offsetHeight || 320;

    let top = rect.bottom + 8;

    if (top + ph > window.innerHeight - 12) {
      top = rect.top - ph - 8;

      if (top < 8) {
        top = 8;
      }
    }

    picker.style.top = top + "px";

    // Clamp left inside viewport
    const pw = picker.offsetWidth;

    let left = rect.left;

    if (left + pw > window.innerWidth - 12) {
      left = window.innerWidth - pw - 12;
    }

    if (left < 12) {
      left = 12;
    }

    picker.style.left = left + "px";
  }

  // Open picker on input click
  function setPickerVisible(show) {
    picker.hidden = !show;

    if (show) {
      document.body.classList.add(
        "no-scroll-picker"
      );

      // Initialize temporary selection
      // from existing scheduledAt or clear
      const booking = getBooking();

      if (booking.movie?.scheduledAt) {
        const v = booking.movie.scheduledAt;
        const parsed = new Date(v);

        if (!Number.isNaN(parsed.getTime())) {
          input._tempDate = parsed;
        } else {
          input._tempDate = null;
        }
      } else {
        input._tempDate = null;
      }

      renderCalendar();
      renderTimes();

      requestAnimationFrame(() => {
        positionPicker();
      });
    } else {
      document.body.classList.remove(
        "no-scroll-picker"
      );
    }
  }

  // picker.hidden === true means closed
  input.addEventListener("click", () => {
    setPickerVisible(picker.hidden);
  });

  // Close when clicking outside
  document.addEventListener("click", (ev) => {
    if (!picker.hidden) {
      const path =
        typeof ev.composedPath === "function"
          ? ev.composedPath()
          : [];

      const clickedInsidePicker =
        path.includes(picker) ||
        path.includes(input);

      if (!clickedInsidePicker) {
        setPickerVisible(false);
      }
    }
  });

  // Close on escape
  document.addEventListener("keydown", (ev) => {
    if (
      ev.key === "Escape" &&
      !picker.hidden
    ) {
      setPickerVisible(false);
    }
  });

  // Close on resize
  window.addEventListener("resize", () => {
    if (!picker.hidden) {
      try {
        positionPicker();
      } catch (e) {
        setPickerVisible(false);
      }
    }
  });

  // Reposition on scroll
  window.addEventListener(
    "scroll",
    () => {
      if (!picker.hidden) {
        positionPicker();
      }
    },
    { passive: true }
  );

  // ==========================================================
  // OK / CANCEL
  // ==========================================================

  okBtn?.addEventListener("click", () => {
    if (!input._tempDate) return;

    input.value = localIso(input._tempDate);

    const currentBooking = getBooking();

    updateBooking({
      movie: {
        ...currentBooking.movie,
        scheduledAt: input.value,
      },
    });

    input._selectedDate =
      input._tempDate.toISOString();

    // Remove validation styling
    input.classList.remove("invalid");

    setPickerVisible(false);
  });

  cancelBtn?.addEventListener("click", () => {
    // Discard temporary selection
    const booking = getBooking();

    if (booking.movie?.scheduledAt) {
      input.value =
        booking.movie.scheduledAt;
    } else {
      input.value = "";
    }

    input._tempDate = null;

    setPickerVisible(false);
  });

  // If there is an existing scheduledAt,
  // show it in input
  const booking = getBooking();

  if (booking.movie?.scheduledAt) {
    input.value =
      booking.movie.scheduledAt;
  }
}

/* ============================================================
   TMDB SEARCH RESULTS
   ============================================================ */

function renderTMDBSearchResults(results) {
  const resultsEl = document.querySelector(
    "[data-movie-search-results]"
  );

  const feedback = document.querySelector(
    "[data-movie-search-feedback]"
  );

  if (!resultsEl) return;

  tmdbSearchResults = results;

  if (!results || results.length === 0) {
    resultsEl.hidden = true;

    if (feedback) {
      feedback.textContent =
        "No TMDB results found for that search.";

      feedback.hidden = false;
    }

    return;
  }

  if (feedback) {
    feedback.textContent =
      "Showing TMDB search results.";

    feedback.hidden = false;
  }

  resultsEl.hidden = false;

  resultsEl.innerHTML = results
    .map((movie) => {
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";

      const releaseDate = movie.release_date
        ? ` • ${movie.release_date.slice(0, 4)}`
        : "";

      const rating = movie.vote_average
        ? `★ ${movie.vote_average.toFixed(1)}`
        : "";

      return `
        <div
          class="movie-card search-result"
          data-tmdb-id="${movie.id}"
        >
          <div class="check">+</div>

          <img
            class="poster"
            src="${poster}"
            alt="${movie.title} poster"
            loading="lazy"
          />

          <div class="info">
            <div class="title">
              ${movie.title}
            </div>

            <div class="tags">
              <span class="tag">
                TMDB${releaseDate}
              </span>

              <span class="tag rating">
                ${rating}
              </span>
            </div>

            <div class="desc">
              ${movie.overview || "No overview available."}
            </div>

            <div class="select-btn">
              Choose this movie →
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  resultsEl
    .querySelectorAll(".movie-card.search-result")
    .forEach((card) => {
      card.addEventListener("click", () =>
        handleTMDBResultClick(
          card.dataset.tmdbId
        )
      );
    });
}

function debounce(fn, delay = 300) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(
      () => fn(...args),
      delay
    );
  };
}

/* ============================================================
   TMDB API
   ============================================================ */

async function fetchTMDBMovies(query) {
  const feedback = document.querySelector(
    "[data-movie-search-feedback]"
  );

  if (
    !TMDB_API_KEY ||
    TMDB_API_KEY === "YOUR_TMDB_API_KEY"
  ) {
    if (feedback) {
      feedback.textContent =
        "TMDB search is not configured. Add your TMDB API key in js/movies.js.";

      feedback.hidden = false;
    }

    return [];
  }

  try {
    const url = new URL(
      TMDB_SEARCH_URL
    );

    url.searchParams.set(
      "api_key",
      TMDB_API_KEY
    );

    url.searchParams.set(
      "query",
      query
    );

    url.searchParams.set(
      "include_adult",
      "false"
    );

    const response =
      await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `TMDB ${response.status}`
      );
    }

    const data =
      await response.json();

    return Array.isArray(data.results)
      ? data.results.slice(0, 8)
      : [];
  } catch (error) {
    if (feedback) {
      feedback.textContent =
        "TMDB search failed. Please check your API key and network connection.";

      feedback.hidden = false;
    }

    console.warn(
      "TMDB search error:",
      error
    );

    return [];
  }
}

/* ============================================================
   MOVIE SEARCH
   ============================================================ */

function wireMovieSearch() {
  const searchInput =
    document.querySelector(
      "[data-movie-search]"
    );

  const feedback =
    document.querySelector(
      "[data-movie-search-feedback]"
    );

  if (!searchInput) return;

  const updateSearch = async () => {
    const query =
      searchInput.value.trim();

    if (!query) {
      renderTMDBSearchResults([]);

      if (feedback) {
        feedback.hidden = true;
        feedback.textContent = "";
      }

      return;
    }

    if (feedback) {
      feedback.textContent =
        "Searching TMDB...";

      feedback.hidden = false;
    }

    const results =
      await fetchTMDBMovies(query);

    renderTMDBSearchResults(
      results
    );
  };

  const debouncedUpdate =
    debounce(
      updateSearch,
      400
    );

  searchInput.addEventListener(
    "input",
    debouncedUpdate
  );
}

/* ============================================================
   MOVIE SELECTION
   ============================================================ */

function handleTMDBResultClick(tmdbId) {
  const movie =
    tmdbSearchResults.find(
      (item) =>
        String(item.id) ===
        String(tmdbId)
    );

  if (!movie) return;

  const styledMovie = {
    id: `tmdb-${movie.id}`,
    title: movie.title,

    genre: movie.release_date
      ? movie.release_date.slice(0, 4)
      : "Movie",

    duration: movie.runtime
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : "TBD",

    rating: movie.vote_average
      ? movie.vote_average.toFixed(1)
      : "N/A",

    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Image",

    description:
      movie.overview ||
      "No description available.",

    tagline:
      movie.tagline || "",

    trailer: "",

    highlight:
      "Added from TMDB search.",

    themeColor:
      "#8b7cff",

    themeSoft:
      "rgba(139,124,255,0.16)",

    gif: "",
  };

  selectMovieFromSearch(
    styledMovie
  );
}

function selectMovieFromSearch(movie) {
  /*
   * IMPORTANT:
   * Validate showtime BEFORE selecting the movie.
   *
   * This prevents the movie-card click from
   * bypassing the date/time validation.
   */
  if (!validateShowtime()) {
    return;
  }

  currentMovieId = movie.id;
  selectedMovie = movie;

  const datetimeInput =
    document.querySelector(
      "[data-showtime-datetime]"
    );

  const scheduledAt =
    datetimeInput?.value || "";

  updateBooking({
    movie: {
      id: movie.id,
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      rating: movie.rating,
      poster: movie.poster,

      showtime: scheduledAt
        ? "scheduled"
        : "",

      scheduledAt,

      gif: movie.gif || "",

      themeColor:
        movie.themeColor || "",

      themeSoft:
        movie.themeSoft || "",
    },
  });

  showConfirmFlash(movie);
}

/* ============================================================
   CONTINUE BUTTON
   ============================================================ */

function wireContinueButton() {
  const continueBtn =
    document.querySelector(
      "[data-movie-continue]"
    );

  if (!continueBtn) return;

  continueBtn.addEventListener(
    "click",
    () => {
      const booking =
        getBooking();

      const movie =
        selectedMovie ||
        (booking.movie?.id
          ? booking.movie
          : null);

      // First validate movie
      if (!movie || !movie.id) {
        showToast(
          "Please choose a movie before continuing.",
          "danger"
        );

        return;
      }

      // Then validate showtime
      if (!validateShowtime()) {
        return;
      }

      showConfirmFlash(movie);
    }
  );
}

/* ============================================================
   CONFIRMATION FLASH
   ============================================================ */

function showConfirmFlash(movie) {
  const flash =
    document.querySelector(
      "[data-confirm-flash]"
    );

  if (!flash) {
    window.location.href =
      "seats.html";

    return;
  }

  flash.querySelector(
    "[data-flash-title]"
  ).textContent =
    movie.title;

  flash.classList.add("show");

  setTimeout(() => {
    window.location.href =
      "seats.html";
  }, 1000);
}

/* ============================================================
   EXPORT
   ============================================================ */

export {
  initMoviesPage
};