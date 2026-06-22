const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");

const forecastContainer = document.getElementById("forecastContainer");
const error = document.getElementById("error");
const loading = document.getElementById("loading");


/*
Get coordinates from city name
*/
async function getCoordinates(city){

    const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if(!data.results){
        throw new Error("City not found");
    }

    return data.results[0];
}


/*
Fetch weather using latitude and longitude
*/
async function getWeather(lat, lon){

    const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

    const response = await fetch(url);

    return await response.json();
}


/*
Convert weather code to description and icon
*/
function getWeatherDescription(code){

    if(code === 0)
        return {text:"Clear Sky", icon:"☀"};

    if([1,2,3].includes(code))
        return {text:"Partly Cloudy", icon:"⛅"};

    if([45,48].includes(code))
        return {text:"Foggy", icon:"🌫"};

    if([51,53,55].includes(code))
        return {text:"Drizzle", icon:"🌦"};

    if([61,63,65].includes(code))
        return {text:"Rain", icon:"🌧"};

    if([71,73,75].includes(code))
        return {text:"Snow", icon:"❄"};

    if([80,81,82].includes(code))
        return {text:"Rain Showers", icon:"🌦"};

    if(code === 95)
        return {text:"Thunderstorm", icon:"⛈"};

    return {text:"Unknown", icon:"❓"};
}


/*
Display current weather on page
*/
function displayCurrentWeather(data, city, country){

    const weather = getWeatherDescription(
        data.current.weather_code
    );

    cityName.textContent = `${city}, ${country}`;
    temperature.textContent =
        `${data.current.temperature_2m}°C`;

    description.textContent = weather.text;

    humidity.textContent =
        `${data.current.relative_humidity_2m}%`;

    wind.textContent =
        `${data.current.wind_speed_10m} km/h`;

    weatherIcon.textContent = weather.icon;
}


/*
Display 5-day forecast
*/
function displayForecast(daily){

    forecastContainer.innerHTML = "";

    for(let i = 0; i < 5; i++){

        const weather =
            getWeatherDescription(daily.weather_code[i]);

        const day =
            new Date(daily.time[i]).toLocaleDateString(
                "en-US",
                {weekday:"long"}
            );

        const card = document.createElement("div");

        card.classList.add("forecast-card");

        card.innerHTML = `
            <h3>${day}</h3>
            <span>${weather.icon}</span>
            <span>${daily.temperature_2m_max[i]}°C</span>
            <span>${daily.temperature_2m_min[i]}°C</span>
        `;

        forecastContainer.appendChild(card);
    }
}


/*
Show error messages
*/
function showError(message){
    error.textContent = message;
}


/*
Main search function
*/
async function handleSearch(){

    const city = cityInput.value.trim();

    if(city === ""){
        showError("Please enter a city name");
        return;
    }

    try{

        loading.textContent = "Loading...";
        error.textContent = "";

        const location =
            await getCoordinates(city);

        const weatherData =
            await getWeather(
                location.latitude,
                location.longitude
            );

        displayCurrentWeather(
            weatherData,
            location.name,
            location.country
        );

        displayForecast(weatherData.daily);

    }catch(err){

        showError(err.message);

    }finally{
        loading.textContent = "";
    }
}

searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        handleSearch();
    }
});



window.addEventListener("load", () => {

    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(
            async position => {

                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const weatherData =
                    await getWeather(lat, lon);

                displayCurrentWeather(
                    weatherData,
                    "Your Location",
                    ""
                );

                displayForecast(weatherData.daily);
            }
        );
    }
});