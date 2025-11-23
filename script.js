// 🌦️ WEATHER FORECAST APP - SCRIPT.JS
// -----------------------------------
// This script fetches real-time weather and 5-day forecast data
// using OpenWeather API and updates the UI dynamically
// with animated backgrounds and temperature unit toggling.

// 🔑 API key from OpenWeatherMap
const apiKey = "378f0b9c122b394340770f309e97117e";

// 🌤️ DOM element references
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
const forecastDiv = document.getElementById("forecast");
const background = document.getElementById("background");

// 🌡️ Default temperature unit is Celsius
let isCelsius = true;

// 🔍 Search button event
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() !== "") getWeatherByCity(cityInput.value);
});

// 🔄 Toggle between Celsius and Fahrenheit
document.getElementById("unitToggle").addEventListener("click", () => {
  isCelsius = !isCelsius;
  document.getElementById("unitToggle").textContent =
    isCelsius ? "Switch °C/°F" : "Switch °F/°C";

  // Refresh current weather with new unit
  if (cityInput.value.trim() !== "") getWeatherByCity(cityInput.value);
  else getWeatherByLocation();
});

// 📍 Auto-load weather for user's current location
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => getWeatherByCity("Pune") // Default fallback city
    );
  } else {
    getWeatherByCity("Pune");
  }
};

// 🌍 Get weather data using coordinates
async function getWeatherByCoords(lat, lon) {
  const unit = isCelsius ? "metric" : "imperial";

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`
  );
  const data = await res.json();

  const forecastRes = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`
  );
  const forecastData = await forecastRes.json();

  displayWeather(data, forecastData);
  displayForecast(forecastData);
}

// 🏙️ Get weather data by city name
async function getWeatherByCity(city) {
  const unit = isCelsius ? "metric" : "imperial";

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`
  );
  const data = await res.json();

  if (data.cod !== 200) {
    alert("City not found");
    return;
  }

  const forecastRes = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`
  );
  const forecastData = await forecastRes.json();

  displayWeather(data, forecastData);
  displayForecast(forecastData);
}

// 🧾 Display current weather information
function displayWeather(data, forecastData) {
  weatherInfo.classList.remove("hidden");

  // ✅ Correct Chinchvad → Chinchwad spelling automatically
  let cityName = data.name.trim();
  if (cityName.toLowerCase() === "chinchvad") cityName = "Chinchwad";

  // 🏙️ Display city and country
  document.getElementById("cityName").textContent = `${cityName}, ${data.sys.country}`;

  // 🌤️ Weather description
  document.getElementById("description").textContent = data.weather[0].description;

  // 🌡️ Temperature display with current unit
  document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°${isCelsius ? "C" : "F"}`;

  // 💧 Other weather details
  document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById("wind").textContent = `Wind: ${data.wind.speed}${isCelsius ? " m/s" : " mph"}`;
  document.getElementById("precip").textContent = `Pressure: ${data.main.pressure} hPa`;

  // 📊 Calculate today's min and max temperature
  const today = new Date().getDate();
  const todayTemps = forecastData.list
    .filter(f => new Date(f.dt_txt).getDate() === today)
    .map(f => f.main.temp);
  const minToday = Math.min(...todayTemps);
  const maxToday = Math.max(...todayTemps);

  document.getElementById("minmax").textContent = `Min: ${Math.round(minToday)}°, Max: ${Math.round(maxToday)}°`;

  // 🌈 Dynamic animated background update
  const weatherMain = data.weather[0].main.toLowerCase();

  // Reset background before applying new weather class
  background.className = "background min-h-screen flex flex-col items-center justify-center text-gray-800 transition-all duration-700 bg-animated";

  if (weatherMain.includes("clear")) background.classList.add("bg-clear");
  else if (weatherMain.includes("cloud")) background.classList.add("bg-clouds");
  else if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) background.classList.add("bg-rain");
  else if (weatherMain.includes("snow")) background.classList.add("bg-snow");
  else if (weatherMain.includes("thunder")) background.classList.add("bg-thunder");
  else if (weatherMain.includes("mist") || weatherMain.includes("fog")) background.classList.add("bg-mist");
}

// 📅 Display 5-day forecast
function displayForecast(forecastData) {
  // Filter forecast for every 8th reading (~1 per day)
  const list = forecastData.list.filter((_, i) => i % 8 === 0);

  forecastDiv.innerHTML = list
    .map(day => {
      const d = new Date(day.dt_txt);
      const options = { weekday: "short" };

      return `
        <div class="bg-white bg-opacity-60 rounded-lg p-2 shadow text-center w-20">
          <p class="font-semibold">${d.toLocaleDateString(undefined, options)}</p>
          <img 
  src="https://openweathermap.org/img/wn/${day.weather[0].icon ? day.weather[0].icon : "01d"}@2x.png" 
  onerror="this.src='https://openweathermap.org/img/wn/01d@2x.png'" 
  class="mx-auto"
/>

          <p>${Math.round(day.main.temp)}°${isCelsius ? "C" : "F"}</p>
        </div>`;
    })
    .join("");
}
