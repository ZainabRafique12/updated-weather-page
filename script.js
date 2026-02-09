const tempratureField = document.querySelector(".temp p");
const locationField = document.querySelector(".time-locat p");
const dateandTimeField = document.querySelector(".time-locat span");
const conditionField = document.querySelector(".condition p");
const searchField = document.querySelector(".search-area");
const form = document.querySelector("form");
const weatherIcon = document.querySelector(".weather-icon");
const weatherContainer = document.querySelector(".weather-container");
const forecastContainer = document.querySelector(".forecast-container");
const errorDisplay = document.getElementById("error-msg");

// ✅ NEW: AQI and Weather Details Elements
const aqiContainer = document.querySelector(".aqi-container");
const aqiValue = document.getElementById("aqi-value");
const aqiLabel = document.getElementById("aqi-label");
const weatherDetails = document.querySelector(".weather-details");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const feelsLikeEl = document.getElementById("feels-like");
const uvIndexEl = document.getElementById("uv-index");

form.addEventListener('submit', searchForLocation);

let target = "Abbottabad, Pakistan";

// ✅ NEW: Parallel API Calls Function
const fetchResult = async (target) => {
    try {
        // WeatherAPI.com API call with AQI enabled
        let weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=ca6efb4e5dd34da2b3163407260402&q=${target}&days=3&aqi=yes`;
        
        // ✅ PARALLEL FETCH - Dono API calls ek saath hongi
        const weatherRes = await fetch(weatherUrl);
        
        if (!weatherRes.ok) throw new Error("City not found");

        const weatherData = await weatherRes.json();
        
        // Error message hide karna
        errorDisplay.style.display = "none";

        // Weather data extract karna
        let locationName = weatherData.location.name;
        let time = weatherData.location.localtime;
        let temp = weatherData.current.temp_c;
        let condition = weatherData.current.condition.text;
        let iconField = weatherData.current.condition.icon;
        let forecastDays = weatherData.forecast.forecastday;

        // ✅ NEW: Additional Weather Details
        let humidity = weatherData.current.humidity;
        let windSpeed = weatherData.current.wind_kph;
        let feelsLike = weatherData.current.feelslike_c;
        let uvIndex = weatherData.current.uv;

        // ✅ NEW: AQI Data (WeatherAPI includes this)
        let aqiData = weatherData.current.air_quality;

        lastFetchedData = weatherData;
        
        // Update karna with new parameters
        updateDetails(temp, locationName, time, condition, iconField, forecastDays, humidity, windSpeed, feelsLike, uvIndex, aqiData);
        
    } catch (error) {
        errorDisplay.style.display = "block";
        console.log("Error fetching weather:", error);
        // AQI aur details hide karna on error
        aqiContainer.style.display = "none";
        weatherDetails.style.display = "none";
    }
}

// ✅ UPDATED: updateDetails function with AQI and weather details
function updateDetails(temp, locationName, time, condition, iconField, forecastDays, humidity, windSpeed, feelsLike, uvIndex, aqiData) {
    // Fade-in Animation
    weatherContainer.classList.remove("fade-in");
    void weatherContainer.offsetWidth;
    weatherContainer.classList.add("fade-in");

    let splitDate = time.split(' ')[0];
    let splitTime = time.split(' ')[1];
    let currentDay = getDayName(new Date(splitDate).getDay());

    weatherIcon.src = "https:" + iconField;
    tempratureField.innerText = `${temp}°C`;
    locationField.innerText = locationName;
    dateandTimeField.innerText = `${splitDate} ${currentDay} ${splitTime}`;
    conditionField.innerText = condition;

    // ✅ NEW: Update Weather Details
    humidityEl.innerText = `${humidity}%`;
    windEl.innerText = `${windSpeed} km/h`;
    feelsLikeEl.innerText = `${feelsLike}°C`;
    uvIndexEl.innerText = uvIndex;

    // Show weather details
    weatherDetails.style.display = "grid";

    // ✅ NEW: Update AQI
    if (aqiData && aqiData.pm2_5) {
        updateAQI(aqiData);
        aqiContainer.style.display = "block";
    } else {
        aqiContainer.style.display = "none";
    }

    // Forecast update
    forecastContainer.innerHTML = ""; 
    forecastDays.forEach(day => {
        const date = new Date(day.date);
        const dayLabel = getDayName(date.getDay()).substring(0, 3);
        
        forecastContainer.innerHTML += `
            <div class="forecast-card fade-in">
                <p class="forecast-date">${dayLabel}</p>
                <img src="https:${day.day.condition.icon}" alt="icon">
                <p>${day.day.avgtemp_c}°</p>
            </div>
        `;
    });

    changeBackground(condition);
}

// ✅ NEW: AQI Update Function
function updateAQI(aqiData) {
    // US EPA standard use kar rahe hain (PM2.5 based)
    const pm25 = aqiData.pm2_5;
    let aqi, category, colorClass;

    // Calculate AQI from PM2.5
    if (pm25 <= 12) {
        aqi = Math.round((50 / 12) * pm25);
        category = "Good";
        colorClass = "aqi-good";
    } else if (pm25 <= 35.4) {
        aqi = Math.round(50 + ((100 - 50) / (35.4 - 12.1)) * (pm25 - 12.1));
        category = "Moderate";
        colorClass = "aqi-moderate";
    } else if (pm25 <= 55.4) {
        aqi = Math.round(100 + ((150 - 100) / (55.4 - 35.5)) * (pm25 - 35.5));
        category = "Unhealthy for Sensitive";
        colorClass = "aqi-unhealthy-sensitive";
    } else if (pm25 <= 150.4) {
        aqi = Math.round(150 + ((200 - 150) / (150.4 - 55.5)) * (pm25 - 55.5));
        category = "Unhealthy";
        colorClass = "aqi-unhealthy";
    } else if (pm25 <= 250.4) {
        aqi = Math.round(200 + ((300 - 200) / (250.4 - 150.5)) * (pm25 - 150.5));
        category = "Very Unhealthy";
        colorClass = "aqi-very-unhealthy";
    } else {
        aqi = Math.round(300 + ((500 - 300) / (500.4 - 250.5)) * (pm25 - 250.5));
        category = "Hazardous";
        colorClass = "aqi-hazardous";
    }

    aqiValue.innerText = aqi;
    aqiLabel.innerText = category;
    aqiLabel.className = `aqi-label ${colorClass}`;
}

function searchForLocation(e) {
    e.preventDefault();
    target = searchField.value;
    fetchResult(target);
    searchField.value = "";
}

fetchResult(target);

function getDayName(number) {
    switch (number) {
        case 0: return 'Sunday';
        case 1: return 'Monday';
        case 2: return 'Tuesday';
        case 3: return 'Wednesday';
        case 4: return 'Thursday';
        case 5: return 'Friday';
        case 6: return 'Saturday';
    }
}

function changeBackground(condition) {
    const body = document.body;
    const weather = condition.toLowerCase(); 
    body.className = ""; 

    if (weather.includes("sunny") || weather.includes("clear")) {
        body.classList.add("sunny");
    } else if (weather.includes("cloud") || weather.includes("overcast") || weather.includes("mist")) {
        body.classList.add("cloudy");
    } else if (weather.includes("rain") || weather.includes("drizzle") || weather.includes("thunder")) {
        body.classList.add("rainy");
    } else if (weather.includes("snow") || weather.includes("ice")) {
        body.classList.add("cold");
    } else {
        body.classList.add("default-bg");
    }
}

// Location and Unit Converter (Same as before)
const locationBtn = document.getElementById("get-location");
const unitC = document.getElementById("unit-c");
const unitF = document.getElementById("unit-f");
let currentUnit = "C"; 
let lastFetchedData = null; 

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            target = `${lat},${lon}`;
            fetchResult(target);
        }, (error) => {
            alert("Location access denied. Please enter city manually.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

// ✅ UPDATED: Unit Converter with new weather details
unitF.addEventListener("click", () => {
    currentUnit = "F";
    unitF.style.color = "yellow";
    unitC.style.color = "white";
    if(lastFetchedData) updateDisplayWithUnits();
});

unitC.addEventListener("click", () => {
    currentUnit = "C";
    unitC.style.color = "yellow";
    unitF.style.color = "white";
    if(lastFetchedData) updateDisplayWithUnits();
});

function updateDisplayWithUnits() {
    if(!lastFetchedData) return;
    
    const temp = currentUnit === "C" ? lastFetchedData.current.temp_c : lastFetchedData.current.temp_f;
    const feelsLike = currentUnit === "C" ? lastFetchedData.current.feelslike_c : lastFetchedData.current.feelslike_f;
    
    tempratureField.innerText = `${temp}°${currentUnit}`;
    feelsLikeEl.innerText = `${feelsLike}°${currentUnit}`;
    
    // Forecast update with units
    const forecastDays = lastFetchedData.forecast.forecastday;
    forecastContainer.innerHTML = ""; 
    forecastDays.forEach(day => {
        const date = new Date(day.date);
        const dayLabel = getDayName(date.getDay()).substring(0, 3);
        const avgTemp = currentUnit === "C" ? day.day.avgtemp_c : day.day.avgtemp_f;
        
        forecastContainer.innerHTML += `
            <div class="forecast-card fade-in">
                <p class="forecast-date">${dayLabel}</p>
                <img src="https:${day.day.condition.icon}" alt="icon">
                <p>${avgTemp}°</p>
            </div>
        `;
    });
}
