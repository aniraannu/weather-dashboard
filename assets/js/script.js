//Get the elements needed using the id values and assign them to elements
var searchFormEl = document.querySelector("#search-form");
var searchFormCityInputEl = document.querySelector("#search-form-city-input");
var weatherDayCityEl = document.querySelector("#weather-day-city");
var weatherDayTempEl = document.querySelector("#weather-day-temp");
var weatherDayWindEl = document.querySelector("#weather-day-wind");
var weatherDayHumidityEl = document.querySelector("#weather-day-humidity");
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
    //looping through all the 5 wheather objects in the daily weather data
    for (const date in dailyWeatherData) {
        dailyWeatherData[date].forEach(item => {
            var temp = item.main.temp_max;
            var windSpeed = item.wind.speed;
            var humidity = item.main.humidity;
            var icon = item.weather[0].icon;
            //create a div elemnt 
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
            // appends the created div to the forecast container defined in the HTML
            forecastContainerEl.append(div);
        })
    }
}
//get the weather data using the openweather API
const getCityDayWeather = function (city) {
    //fetch api method
    //first fetch request to get the latitude and longitude of the city by name
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`;
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
            //Calling the function to store city into local storage
            storeCityLocation(city);
            //populate the recent search buttons with the city names stored in local storage
            populateButton();

            var cityObject = data[0];
            var lat = cityObject.lat;
            var lon = cityObject.lon;
            //url to get the forecast data by passing latitude and longitude values of a city
            var currentWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?&units=imperial&lat=${lat}&lon=${lon}&appid=${APIKey}`;
            //second fetch call to get forecast data for 5 days, every 3hr
            fetch(currentWeatherUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    const current = data.list;
                    const dailyWeatherData = {};
                    current.forEach(dataPoint => {
                        // Extract date from dt_txt field
                        //split is used to get the date field alone excluding time 
                        const date = dataPoint.dt_txt.split(' ')[0];
                        //regroup the forecast data for each date
                        if (!dailyWeatherData[date]) {
                            dailyWeatherData[date] = [];
                        }
                        //slice the forecast data to return only one object per day
                        if (dataPoint.dt_txt.slice(11, 13) == '12') {
                            dailyWeatherData[date].push(dataPoint);
                        }
                    });
                    //daily weather data contains 1 foreacst data each for 5 days
                    console.log(`dailyWeatherData`, dailyWeatherData);
                    //get the current forecast data
                    //use the first day values
                    // Access the weather data for the first day
                    const firstDate = Object.keys(dailyWeatherData)[0];
                    const weatherDataForFirstDay = dailyWeatherData[firstDate];

                    // Access the forecast data needed for the first data point of the first day
                    const firstDataPoint = weatherDataForFirstDay[0];
                    const temp = firstDataPoint.main.temp_max;
                    const windSpeed = firstDataPoint.wind.speed;
                    const humidity = firstDataPoint.main.humidity;
                    const icon = firstDataPoint.weather[0].icon;
                    //assign the values to the elements
                    currentDate.textContent = firstDate;
                    weatherDayCityEl.textContent = city;
                    weatherDayTempEl.textContent = temp + "F";
                    weatherDayWindEl.textContent = windSpeed + " MPH";
                    weatherDayHumidityEl.textContent = humidity + " %";
                    weatherDayIconEl.src = `https://openweathermap.org/img/wn/${icon}.png`;
                    //calling the fuction to populate the forecast data for next 5 days
                    populate5day(dailyWeatherData);
                });
        })
}
//popopulate search history buttons and links when you click in search history
function populateButton() {
    buttonContainerEl.innerHTML = "";
    //get the cities stored in the local storage
    var cities = window.localStorage.getItem("cities");
    if (cities) {
        cities = JSON.parse(cities)
    } else {
        cities = []
    }
    //create a button with the city values stored in the localStorage
    cities.forEach(function (city) {
        var button = document.createElement("button");
        button.classList = "btn btn-secondary";
        button.textContent = city;
        button.setAttribute("data-city", city);
        //appending the button created to the buttons container in HTML doc
        buttonContainerEl.appendChild(button);
    })
}
// stores search history into local storage
function storeCityLocation(city) {
    //get the previously stored cities in the local storage
    var cities = window.localStorage.getItem("cities");
    if (cities) {
        cities = JSON.parse(cities)
    } else {
        cities = []
    }
    //return in case the city that is searched is already there in the localStorage
    if (cities.includes(city)) {
        return;
    } 
    //if the searched city is not in the localStorage, push that city value into localStorage
    else {
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