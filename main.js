const moodTracker = document.querySelector("#mood-tracker");
const moodViewer = document.querySelector("#mood-viewer");
const moodOptions = moodTracker.querySelectorAll(".mood__option");
const currentDateEl = moodTracker.querySelector("#current-date");
const saveButton = moodTracker.querySelector("#save-button");
const moodViews = moodViewer.querySelectorAll(".mood__view");
const moodMonthContainer = document.querySelector(".mood-month__days");

let selectedMood = null;
const today = new Date().toISOString().split("T")[0];
let moods = JSON.parse(localStorage.getItem("moods")) || [];
const todayMood = moods.find((mood) => mood.date === today);
let currentView = localStorage.getItem("currentView") || "day";

if (todayMood) {
  switchToViewer();
  displayMood(currentView);
}

currentDateEl.textContent = getCurrentDate();

moodOptions.forEach((option) => {
  option.addEventListener("click", () => {
    moodOptions.forEach((e) => e.classList.remove("mood__option--active"));
    option.classList.add("mood__option--active");

    selectedMood = {
      emoji: option.querySelector(".mood__option-emoji").textContent,
      text: option.querySelector(".mood__option-text").textContent,
      date: today,
    };
  });
});

saveButton.addEventListener("click", () => {
  if (!selectedMood) return alert("Please select a mood!");

  let moods = JSON.parse(localStorage.getItem("moods")) || [];
  moods = moods.filter((mood) => mood.date !== selectedMood.date);
  moods.push(selectedMood);
  localStorage.setItem("moods", JSON.stringify(moods));

  switchToViewer();
  displayMood(currentView);
});

function switchToViewer() {
  moodTracker.style.display = "none";
  moodViewer.style.display = "block";
}

moodViews.forEach((btn) => {
  if (btn.textContent.toLowerCase() === currentView) {
    btn.classList.add("mood__view--active");
  } else {
    btn.classList.remove("mood__view--active");
  }
});

moodViews.forEach((view) => {
  view.addEventListener("click", () => {
    moodViews.forEach((btn) => btn.classList.remove("mood__view--active"));

    view.classList.add("mood__view--active");
    currentView = view.textContent.toLowerCase();
    localStorage.setItem("currentView", currentView);
    displayMood(currentView);
  });
});

function displayMood(view) {
  moods = JSON.parse(localStorage.getItem("moods")) || [];
  const todayMood = moods.find((mood) => mood.date === today);

  ["day", "week", "month"].forEach((v) => {
    moodViewer.querySelector(`.mood-${v}`).style.display = "none";
  });

  if (view === "day") {
    if (todayMood) {
      moodViewer.querySelector(".mood-day").style.display = "block";
      moodViewer.querySelector(".mood-day__emoji").textContent =
        todayMood.emoji;
      moodViewer.querySelector(
        ".mood-day__text"
      ).textContent = `Today, you're feeling ${todayMood.text.toLowerCase()}`;
      moodViewer.querySelector(".mood-day__current-date").textContent =
        getCurrentDate();
    }
  } else if (view === "week") {
    moodViewer.querySelector(".mood-week").style.display = "block";
    moodViewer.querySelector(
      ".mood-week__current-date"
    ).textContent = `Today, ${getCurrentDate()}`;

    const startOfWeek = new Date();
    startOfWeek.setDate(
      startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)
    );

    moodViewer.querySelectorAll(".mood-week__column").forEach((col, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(dayDate.getDate() + index);
      const { date, emoji, text } =
        moods.find((m) => m.date === dayDate.toISOString().split("T")[0]) || {};

      col.classList.toggle("mood-week__column--active", date === today);
      col.querySelector(".mood-week__emoji").textContent = emoji || "";
      text
        ? col
            .querySelector(".mood-week__bar")
            .classList.add(`mood-week__bar--${text.toLowerCase()}`)
        : "";
    });
  } else if (view === "month") {
    moodViewer.querySelector(".mood-month").style.display = "block";
    moodViewer.querySelector(
      ".mood-month__current-date"
    ).textContent = `${new Date().toLocaleDateString("en-US", {
      month: "long",
    })}, ${new Date().getFullYear()}`;
    generateMonthCalendar();
  }
}

function getCurrentDate() {
  const date = new Date();
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function generateMonthCalendar() {
  moodMonthContainer.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const dayIndex = i - firstDay + 1;
    const dayEl = document.createElement("div");
    dayEl.classList.add("mood-month__day");

    if (!(dayIndex < 1 || dayIndex > daysInMonth)) {
      dayEl.classList.toggle(
        "mood-month__day--active",
        dayIndex === now.getDate()
      );

      const moodNumber = document.createElement("span");
      moodNumber.classList.add("mood-month__day-text");
      moodNumber.textContent = dayIndex;
      dayEl.appendChild(moodNumber);

      const mood = moods.find(
        (m) =>
          new Date(m.date).getDate() === dayIndex &&
          new Date(m.date).getMonth() === month
      );

      if (mood) {
        const moodEmoji = document.createElement("span");
        moodEmoji.classList.add("mood-month__day-emoji");
        moodEmoji.textContent = mood.emoji;
        dayEl.appendChild(moodEmoji);
      }
    }
    moodMonthContainer.appendChild(dayEl);
  }
}
