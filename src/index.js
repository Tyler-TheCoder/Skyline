import "./style.css";

const vC_key = "GRALNWWFWFGD5T9RJHJZTHJYA"; // visual crossing api key

const locationInput = document.getElementById("locationInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const unitToggle = document.getElementById("unitToggle");
const statusMsg = document.getElementById("statusMsg");

const currentBox = document.getElementById("currentBox");
const currentCity = document.getElementById("currentCity");
const currentDate = document.getElementById("currentDate");
const currentTemp = document.getElementById("currentTemp");
const currentCond = document.getElementById("currentCond");
const statFeels = document.getElementById("statFeels");
const statHumidity = document.getElementById("statHumidity");
const statWind = document.getElementById("statWind");
const statUv = document.getElementById("statUv");
const statSunrise = document.getElementById("statSunrise");
const statSunset = document.getElementById("statSunset");

const forecastBox = document.getElementById("forecastBox");
const forecastRow = document.getElementById("forecastRow");

let unit = "C"; // "C" or "F"

unitToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".unit-toggle__btn");
  if (!btn) return;
  unit = btn.dataset.unit;
  [...unitToggle.children].forEach((b) =>
    b.classList.toggle("is-active", b === btn)
  );
  // Re-fetch with the new unit if a location is already loaded
  if (locationInput.value.trim()) {
    fetchWeather(locationInput.value.trim());
  }
});

searchBtn.addEventListener("click", () => {
  const city = locationInput.value.trim();
  if (city) fetchWeather(city);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("Geolocation is not supported by your browser.", true);
    return;
  }
  setStatus("Getting your location…", false);
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      setStatus("Finding your city…", false);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        const data = await res.json();
        const address = data.address;
        const place =
          address.city || address.town || address.village || address.municipality || address.county;
        const locationName = place
          ? `${place}, ${address.state || address.country}`
          : data.display_name || `${latitude},${longitude}`;
        locationInput.value = locationName;
        fetchWeather(locationName);
      } catch {
        const coords = `${latitude},${longitude}`;
        locationInput.value = coords;
        fetchWeather(coords);
      }
    },
    (error) => {
      setStatus(`Geolocation error: ${error.message}`, true);
    }
  );
});

locationInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = locationInput.value.trim();
    if (city) fetchWeather(city);
  }
});

async function fetchWeather(location) {
  setStatus(`Loading weather for "${location}"…`, false);
  currentBox.classList.add("hidden");
  forecastBox.classList.add("hidden");

  const unitGroup = unit === "C" ? "metric" : "us";
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
    location
  )}?unitGroup=${unitGroup}&include=days&key=${vC_key}&contentType=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        response.status === 400 || response.status === 404
          ? "Location not found. Try a different city, zip, or coordinates."
          : `Request failed (${response.status})`
      );
    }
    const data = await response.json();
    renderCurrent(data);
    renderForecast(data.days.slice(1, 8)); // next days after today
    setStatus("", false);
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Something went wrong fetching the weather.", true);
  }
}

function renderCurrent(data) {
  const today = data.days[0];
  const tempUnit = unit === "C" ? "°C" : "°F";
  const windUnit = unit === "C" ? "km/h" : "mph";

  currentCity.textContent = data.resolvedAddress;
  currentDate.textContent = formatDate(today.datetime);
  currentTemp.textContent = `${Math.round(today.temp)}${tempUnit}`;
  currentCond.textContent = today.conditions;

  statFeels.textContent = `${Math.round(today.feelslike)}${tempUnit}`;
  statHumidity.textContent = `${Math.round(today.humidity)}%`;
  statWind.textContent = `${Math.round(today.windspeed)} ${windUnit}`;
  statUv.textContent = today.uvindex ?? "—";
  statSunrise.textContent = formatTime(today.sunrise);
  statSunset.textContent = formatTime(today.sunset);

  currentBox.classList.remove("hidden");
}

function renderForecast(days) {
  forecastRow.innerHTML = "";
  const tempUnit = unit === "C" ? "°" : "°";

  days.forEach((day) => {
    const card = document.createElement("div");
    card.className = "forecast__day";
    card.innerHTML = `
      <div class="forecast__day-name">${formatDayName(day.datetime)}</div>
      <div class="forecast__day-temp">${Math.round(day.temp)}${tempUnit}</div>
      <div class="forecast__day-range">${Math.round(day.tempmin)}° / ${Math.round(
      day.tempmax
    )}°</div>
      <div class="forecast__day-cond">${day.conditions}</div>
    `;
    forecastRow.appendChild(card);
  });

  forecastBox.classList.remove("hidden");
}

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatDayName(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function setStatus(message, isError) {
  statusMsg.textContent = message;
  statusMsg.classList.toggle("is-error", isError);
}
