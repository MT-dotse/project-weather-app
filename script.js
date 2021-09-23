//SELECTORS
const weatherDisplay = document.getElementById("weather-display");
const fiveDays = document.getElementById("five-days");
const mainSection = document.getElementById("main__section");
const weatherH1 = document.getElementById("heading1");
const pictureWeather = document.getElementById("weatherImage");
const citySelector = document.getElementById("citySelect");

// VARIABLE

//an object that holds all the city id for openweather API
const Cities = {
  Sarajevo: 3191281,
  Stockholm: 2673722,
  Riga: 456172,
  Cadaques: 3127117,
  Barcelona: 3128760,
  Ulm: 2820256,
  Zurich: 2657896,
  LosAngeles: 1705545,
  Podgorica: 3189077,
  Rome: 3169070,
};

// variables that will be used in displaying the current locations weather
let lat, lon;

//** API KEY and ID */
// we will work with only one API ker at time which will be generated using two function either by position or by city id
let API_KEY = "";
const API_ID = "e9b6503c511533b3cad6daef0e4e23a6";

//** FUNCTIONS */

// if location is enabled in the browser we we get the coordinates of lat and long
// if not it will display the time in Rome
// we create and API_KEY = which will display the initial city
// and run the fetch function
const getLocation = () => {
  // here we run a method that gets the current position. This method asks for two callback function
  // first in case the location is enabled and secondly if it is disabled
  navigator.geolocation.getCurrentPosition(
    // first call back if location service is enabled
    (position) => {
      [lat, lon] = [position.coords.latitude, position.coords.longitude]; // store lat and lon values
      makeApiKeyByCords("weather", lat, lon);
      displayWeather(API_KEY);
      makeApiKeyByCords("forecast", lat, lon);
      displayFiveDays(API_KEY);
    },
    // 2nd callback in case location disabled we display Rome
    () => {
      [lat, lon] = [41.9028, 12.4964];
      makeApiKeyByCityId("weather", "Rome");
      displayWeather(API_KEY);
      makeApiKeyByCityId("forecast", "Rome");
      displayFiveDays(API_KEY);
    }
  );
  citySelector.addEventListener("change", changeCity);
};

// This function makes the API key to be fetched,
// As first argument it takes the type of data we are requesting:
// use "weather" for a daily weather
// use "forecast" for a 5 day temperature at 12:00
// second and third argument is latitude and longitude
const makeApiKeyByCords = (type, lat, lon) => {
  if (type === "forecast") {
    API_KEY = `https://api.openweathermap.org/data/2.5/${type}?lat=${lat}&lon=${lon}&units=metric&APPID=${API_ID}`;
  } else {
    API_KEY = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&APPID=${API_ID}`;
  }
};

// This function generates API Key using the value form the select element in DOM
// we get the value through event listener that is passed to changeCity function
// changes the api key with matching city with id from Cities object
const makeApiKeyByCityId = (type, cityName) => {
  if (type === "forecast") {
    API_KEY = `https://api.openweathermap.org/data/2.5/${type}?id=${Cities[cityName]}&units=metric&APPID=${API_ID}`;
  } else {
    API_KEY = `https://api.openweathermap.org/data/2.5/weather?id=${Cities[cityName]}&units=metric&APPID=${API_ID}`;
  }
};

// This function changes the city generate new API key and makes new fetch requests
// function is linked with onChange listener for the select element in DOM
// we also invoke both fetch functions to access API and display information
const changeCity = (e) => {
  makeApiKeyByCityId("weather", e.target.value);
  displayWeather(API_KEY);
  makeApiKeyByCityId("forecast", e.target.value);
  fiveDays.innerHTML = "";
  displayFiveDays(API_KEY);
};

// Function that handles the fetch request and updates the HTML section to display the information
// as an argument it takes the API_KEY which we always pass to it when evoking
const displayWeather = (key) => {
  fetch(key)
    .then((response) => response.json())
    .then((json) => {
      //we adjust the sunset and sunrise time to match the local time of the city
      // value is returned in milliseconds so we * 1000 to get normal time
      const sunriseRealTime = new Date(
        (json.sys.sunrise +
          json.timezone +
          new Date().getTimezoneOffset() * 60) *
          1000
      );
      const sunsetRealTime = new Date(
        (json.sys.sunset +
          json.timezone +
          new Date().getTimezoneOffset() * 60) *
          1000
      );

      // creating local array that holds the sunrise and sunset information
      // in array the order is as follow: [0]sunrise hour, [1]sunrise minutes, [2]sunset hour, [3]sunset minutes
      let minutesAndHours = [
        sunriseRealTime.getHours(),
        sunriseRealTime.getMinutes(),
        sunsetRealTime.getHours(),
        sunsetRealTime.getMinutes(),
      ];

      //here we remap the array to add 0 in front for number 1-9, so it would be displayed for example 07 instead of 7
      minutesAndHours = minutesAndHours.map((item) => {
        if (item < 10) {
          return (item = item.toString().padStart(2, "0"));
        } else {
          return item;
        }
      });

      // The following conditional checks for type of weather and changes the css classes for HTML elements

      // weather API retuns codes for type of weather 800 to 802 is cloud cover less then 50, we think that is sunny
      if (json.weather[0].id >= 800 && json.weather[0].id <= 802) {
        mainSection.className = "main__section sunny";
        citySelector.className = "select sunny";
        weatherH1.innerHTML = `Get your sunnies on ${json.name} is looking rather great today!`;
        pictureWeather.setAttribute(
          "src",
          "./Designs/Design-2/icons/noun_Sunglasses_2055147.svg"
        );
      } else if (
        json.weather[0].main === "Rain" ||
        json.weather[0].main === "Drizzle" ||
        json.weather[0].main === "Thunderstorm" ||
        json.weather[0].main === "Snow"
      ) {
        mainSection.className = "main__section rainy";
        citySelector.className = "select rainy";
        weatherH1.innerHTML = `Don't forget your umbrella. It's wet in ${json.name} today!`;
        pictureWeather.setAttribute(
          "src",
          "/Designs/Design-2/icons/noun_Umbrella_2030530.svg"
        );
      } else {
        mainSection.className = "main__section cloudy";
        citySelector.className = "select cloudy";
        weatherH1.innerHTML = `Light a fire and get cosy. ${json.name} is looking grey today!`;
        pictureWeather.setAttribute(
          "src",
          "/Designs/Design-2/icons/noun_Cloud_1188486.svg"
        );
      }
      // weatherDisplay is one of 3 sections that display the infroamtion
      weatherDisplay.innerHTML = `
    <div>
    <p>City: ${json.name}</p>
    <p> ${Math.floor(json.main.temp)} °C</p>
    <p>Type of weather: ${json.weather[0].description}</p>
    <p>Sunrise: ${minutesAndHours[0]}:${minutesAndHours[1]}</p>
    <p>Sunset: ${minutesAndHours[2]}:${minutesAndHours[3]}</p>
    </div>
    `;
    })
    .catch((error) => {
      console.error("error", error);
    });
};

// SECOND FETCH function that displays the next 5 days weather
// again as argument it takes an API Key
const displayFiveDays = (key) => {
  fetch(key)
    .then((response) => response.json()) //here we get the info and json converts into
    .then((fiveDaysWeather) => {
      // here we start printing the information we are getting from the api
      // since we only want certain values so below we fetch the dates at a specific time
      const filterWeather = fiveDaysWeather.list.filter((item) =>
        item.dt_txt.includes("12:00")
      );
      //create an array with our weekdays
      const weekdays = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      filterWeather.forEach((item) => {
        // convert dt to javascript default date format
        // from seconds => millisecond
        const d = new Date(item.dt * 1000);
        // format the date to a weekday number
        const weekdayNumber = d.getDay();
        // use that number as the index of the array
        // innerHTML = weekdays[weekdayNumber];
        const roundedTemperature = Math.floor(item.main.temp);
        // roundedTemperature = Math.floor(roundedTemperature);

        //printing the weekday number with the weekday array above
        fiveDays.innerHTML += ` 
      <div class="daily-forecast"> 
      <p> ${weekdays[weekdayNumber]}</p> 
      <p> ${roundedTemperature}°C </p>
      </div> 
  `;
      });
    })
    .catch((error) => {
      console.error("error", error);
    });
};

//The first function is invoked - gets the city cords and displays weather
getLocation();
