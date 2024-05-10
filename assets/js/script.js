//Get the elements needed using the id values and assign them to elements
var searchFormEl = document.querySelector("#search-form");
var searchFormCityInputEl = document.querySelector("#search-form-city-input");
var weatherDayCityEl = document.querySelector("#weather-day-city");
var weatherDayTempEl = document.querySelector("#weather-day-temp");
var weatherDayWindEl = document.querySelector("#weather-day-wind");
var weatherDayHumidityEl = document.querySelector("#weather-day-humidity");
var weatherDayUvIndexEl = document.querySelector("#weather-day-index");
var forecastContainerEl = document.querySelector("#forecast-container");
var weatherDayIconEl = document.querySelector("#weather-day-icon");
var buttonContainerEl = document.querySelector("#button-container");
var currentDate = document.querySelector("#current-date");


//get the weather of the selected city using the fetch API
//define the API key value to a variable
const APIKey = "da5da6ae42cd665e481a240233705ce3";

//function to populate 5 days forecast card
function populate5day(dailyWeatherData) {
    forecastContainerEl.innerHTML = "";
    for (const date in dailyWeatherData) {
        dailyWeatherData[date].forEach(item => {
            /*if (index === 0 || index > 5) {
                return;
            }*/
            var temp = item.main.temp_max;
            var windSpeed = item.wind.speed;
            var humidity = item.main.humidity;
            var icon = item.weather[0].icon;
            var div = document.createElement("div");
            // renders HTML for each day of forecast
            div.innerHTML = ` 
            <div class="card-future card">
                <div class="future-body">             
                    <h5 class="card-title" id="date1">${date}</h5>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" />
                    <dl>
                        <dt>Temp:</dt>
                        <dd>${temp} \u00B0F</dd>
                        <dt>Wind:</dt>
                        <dd>${windSpeed} MPH</dd>
                        <dt>Humidity</dt>
                        <dd>${humidity} %</dd>
                    </dl>
                </div>
            </div>
        `
            // appends to html
            forecastContainerEl.append(div);
        })
    }
}
//fetch api 
const getCityDayWeather = function (city) {
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`;
    //first fetch request to get the latitude and longitude of the city by name
    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (!data.length) {
                window.alert("No city matches!");
                return;
            }
            // prevents adding to search history if no city hit
            storeCityLocation(city);
            populateButton();

            var cityObject = data[0];
            var lat = cityObject.lat;
            var lon = cityObject.lon;
            var currentWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?&units=imperial&lat=${lat}&lon=${lon}&appid=${APIKey}`;

            fetch(currentWeatherUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    const current = data.list;
                    //const forecastData = data.list;
                    const dailyWeatherData = {};
                    current.forEach(dataPoint => {
                        // Extract date from dt_txt field
                        const date = dataPoint.dt_txt.split(' ')[0];
                        if (!dailyWeatherData[date]) {
                            dailyWeatherData[date] = [];
                        }
                        if (dataPoint.dt_txt.slice(11, 13) == '12') {
                            dailyWeatherData[date].push(dataPoint);
                        }

                    });
                    console.log(`dailyWeatherData`, dailyWeatherData);
                    for (const date in dailyWeatherData) {
                        console.log(`Date: ${date}`);

                        dailyWeatherData[date].forEach(item => {
                            console.log(`Temperature: ${item.main.temp}`);
                            currentDate.textContent = date;
                            let temp = item.main.temp_max;
                            let windSpeed = item.wind.speed;
                            let humidity = item.main.humidity;
                            let icon = item.weather[0].icon;
                            weatherDayCityEl.textContent = city;
                            weatherDayTempEl.textContent = temp + "F";
                            weatherDayWindEl.textContent = windSpeed + " MPH";
                            weatherDayHumidityEl.textContent = humidity + " %";
                            weatherDayIconEl.src = `https://openweathermap.org/img/wn/${icon}.png`;

                        });
                    }
                    populate5day(dailyWeatherData);
                });
        })
}
//popopulate search history buttons and links when you click in search history
function populateButton() {
    buttonContainerEl.innerHTML = "";
    var cities = window.localStorage.getItem("cities");
    if (cities) {
        cities = JSON.parse(cities)
    } else {
        cities = []
    }
    cities.forEach(function (city) {
        var button = document.createElement("button");
        button.classList = "btn btn-secondary";
        button.textContent = city;
        button.setAttribute("data-city", city);
        buttonContainerEl.appendChild(button);
    })
}
// stores search history into local storage
function storeCityLocation(city) {
    var cities = window.localStorage.getItem("cities");
    if (cities) {
        cities = JSON.parse(cities)
    } else {
        cities = []
    }

    if (cities.includes(city)) {
        return;
    } else {
        cities.push(city);
    }

    window.localStorage.setItem("cities", JSON.stringify(cities));
}

//Getting the weather of a particular city using the input from the search box
//get the name value on submitting the search form and check for valid city name
const handleFormSubmit = function (event) {
    event.preventDefault();
    let city = searchFormCityInputEl.value;
    //check if the user entered a valid city name
    getCityDayWeather(city);
};
//get the weather details by pressing the buttons
//handle the button click function
function handleButtonClick(event) {
    var target = event.target;
    var city = target.getAttribute("data-city");
    getCityDayWeather(city);
}
//Function to adda event listeners to submit search and clicking city search buttons
function addEventListeners() {
    searchFormEl.addEventListener("submit", handleFormSubmit);
    buttonContainerEl.addEventListener("click", handleButtonClick);
}
//intitialising and calling the event listener functions
function init() {
    addEventListeners()
    populateButton();
}

init();