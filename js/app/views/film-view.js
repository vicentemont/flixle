// the point of separating elements from their handlers is flexibility
// I may want elements without any handling functions

import { getFilm, searchFilms, getRandomMovie } from "../services/film-service.js";

// and I may want handlers that are shared by multiple elements
const elements = {};
const handlers = {};

let tryCounter = 0;

let gameWon = false;

// define the correct answer to win the game
let correctAnswer;

export let getNewCorrectAnswer = async function () {
  if (!correctAnswer) {
    console.log('correct answer updated')
    correctAnswer = await getRandomMovie();
  }
  console.log('correct answer exists')
  console.log('correct answer is: ' + correctAnswer.title);
}
// a function to create a single button with some inner text
function createInput() {
  return `<div id="searchSection" class="container"><input autocomplete="off" type="search" id="searchBar" class="container" placeholder="Search movie..."></div>`;
}


function createScoreCounter() {
  return `<div id="counter">
  <p >Number of tries: ${tryCounter}
  </p>
  </div>`
}
// check if string is from a country, to get the flag using country code (ex. GB, PT)
function checkCountry(string, title) {
  if (title === 'COUNTRY') {
    return `<img src="https://flagsapi.com/${string}/flat/48.png">
    `
  } else {
    return `<span> ${string.toUpperCase()} </span>`;
  }
}

// dynamically sets the font size based on textlength
function dynamicFontSize(textLength) {
  if (textLength > 27) {
    return `font-size: 12px;`
  } else if (textLength > 20) {
    return `font-size: 14px;`
  } else if (textLength > 10) {
    return `font-size: 17px;`
  } else {
    return ``;
  }
}

// transforms array into string separating each name with a comma, except the last
function getElementsFromArray(array) {
  let str = ""; // Initialize the variable to store the concatenated string

  if (array.length > 0) {
    array.forEach(element => {
      str += element.name + ', '; // Concatenate each element's name with a comma
    });
    return str.slice(0, -2); // Remove the last comma and return the string
  } else {
    if (array.length === 0) {
      return ""; // Return an empty string if the array is empty
    } else {
      return array[0].name; // Return the name of the first element if there's only one element
    }
  }
}

// transfoms number elements and adds suffix (M or k) or returns the number if it is between 1500 and 2100 for year use
function roundNumber(number) {
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + "B"; // Divide by million and append "M" suffix
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M"; // Divide by million and append "M" suffix
  } else if (number > 1500 && number < 2100) {
    return number;
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "k"; // Divide by thousand and append "k" suffix
  } else {
    return number.toFixed(1); // If the number is less than 1000, return it as is
  }
}

// compares search results with correct game answer and returns correct html with correct color ans proximity symbols
function compare(param, param1, title) {
  if (title === "ACTOR") {
    const actorsIds = param1.map(item => item.id);
    const actorWithHighestPopularity = param1.reduce((prevActor, currentActor) => {
      return (prevActor.popularity > currentActor.popularity) ? prevActor : currentActor;
    });

    if (param.id === actorWithHighestPopularity.id) {
      console.log("entered Equal")
      return `
          <div id="${title}" class="movieDetail" style="background-color: #1ed760d9; ${dynamicFontSize(param.name.length+15)}"> 
              <p class="squareName">M.P.ACTOR</p>
              <div>
                  <span>${param.name.toUpperCase()} </span>
              </div> 
          </div>`;
    } else if (actorsIds.includes(param.id)) {
      return `
      <div id="${title}" class="movieDetail" style="background-color: #ffa500d6; ${dynamicFontSize(param.name.length+15)}"> 
          <p class="squareName">M.P.ACTOR</p>
          <div>
              <span>${param.name.toUpperCase()} </span>
          </div> 
      </div>`
    } else {
      return `
          <div id="${title}" class="movieDetail" style="background-color: rgba(255, 0, 0, 0.8); ${dynamicFontSize(param.name.length+15)}"> 
              <p class="squareName">M.P.ACTOR</p>
              <div>
                  <span>${param.name.toUpperCase()} </span>
              </div> 
          </div>`;
    }
  } else if (Array.isArray(param)) {
    console.log(param, param1);
    const paramIds = param.map(item => item.id);
    const param1Ids = param1.map(item => item.id);

    // Check if both arrays have the same elements
    const areArraysEqual = JSON.stringify(paramIds.sort()) === JSON.stringify(param1Ids.sort());

    if (areArraysEqual) {
      return `
            <div id="${title}" class="movieDetail" style="background-color: #1ed760d9; ${dynamicFontSize(getElementsFromArray(param).length)}"> 
                <p class="squareName">${title}</p>
                <div>
                    <span>${getElementsFromArray(param).toUpperCase()} </span>
                </div> 
            </div>`;
    } else if (paramIds.some(id => param1Ids.includes(id))) {
      return `
            <div id="${title}" class="movieDetail" style="background-color: #ffa500d6; ${dynamicFontSize(getElementsFromArray(param).length)}"> 
                <p class="squareName">${title}</p>
                <div>
                    <span>${getElementsFromArray(param).toUpperCase()} </span>
                </div> 
            </div>`;
    } else {
      return `
            <div id="${title}" class="movieDetail" style="background-color: rgba(255, 0, 0, 0.8); ${dynamicFontSize(getElementsFromArray(param).length)}"> 
                <p class="squareName">${title}</p>
                <div>
                    <span>${getElementsFromArray(param).toUpperCase()} </span>
                </div> 
            </div>`;
    }
  } else if (typeof param === 'string') {
    let compare = param.localeCompare(param1);
    if (compare > 0) {
      return `
      <div id="${title}" class="movieDetail" style="background-color: #ffa500d6; ${dynamicFontSize(checkCountry(param, title))}"> 
      <p class="squareName">${title}</p>
      <div>
      ${checkCountry(param, title)} 
      </div> 
      </div>`;
    } else if (compare === 0) {
      return `<div id="${title}" class="movieDetail" style="background-color: #1ed760d9;${dynamicFontSize(checkCountry(param, title))}"> 
    <p class="squareName">${title}</p>
    <div>
    ${checkCountry(param, title)} 
    </div> 
    </div>`;
    } else {
      return `
    <div id="${title}" class="movieDetail" style="background-color: rgba(255, 0, 0, 0.8);${dynamicFontSize(checkCountry(param, title))}"> 
    <p class="squareName">${title}</p>
    <div>
    ${checkCountry(param, title)} 
    </div> 
    </div>`;
    }
  } else if (param === param1) {
    return `
    <div id="${param}" class="movieDetail" style="background-color: #1ed760d9;"> 
    <p class="squareName">${title}</p>
    <div>
    <span> ${roundNumber(param)} </span>
    </div> 
    </div>`;
  } else if (param > param1) {
    return `
    <div id="${param}" class="movieDetail" style="background-color: #ffa500d6;"> 
    <p class="squareName">${title}</p>
    <div>
    <span>&darr; ${roundNumber(param)} </span>
    </div> 
    </div>`;
  } else if (param < param1) {
    return `
    <div id="${param}" class="movieDetail" style="background-color: #ffa500d6;"> 
    <p class="squareName">${title}</p>
    <div>
    <span>&uarr;${roundNumber(param)}</span>
    </div> 
    </div>`;
  }

}

// a function to create a film card, which is the html code for a single film
function createFilmCard({ id, title, popularity, genres, budget, actors, revenue, director, original_language, vote_average, origin_country, release_date, poster_path }) {
  const actorWithHighestPopularity = actors.reduce((prevActor, currentActor) => {
    return (prevActor.popularity > currentActor.popularity) ? prevActor : currentActor;
  });


  if (id === correctAnswer.id) {
    gameWon = true;
    console.log('You win!');
  }

  return `<div class="gameCardContainer container"><div id="gameCard" class="" style="background-image: url('https://image.tmdb.org/t/p/w500${poster_path}'); background-size: cover">
  <div>
  
  </div>
  <div id="movieTitle">
  <img src="https://image.tmdb.org/t/p/w500${poster_path}" alt="Description of the image" width="100" height="auto">
  <div><h3>${title}</h3></div>
  </div>
  <div id="movieDetails" >
  
  ${compare(vote_average, correctAnswer.vote_average, "TMDB")}
  ${compare(origin_country[0], correctAnswer.origin_country[0], "COUNTRY")}
  ${compare(budget, correctAnswer.budget, "BUDGET")}
  ${compare(Number(release_date.substring(0, 4)), Number(correctAnswer.release_date.substring(0, 4)), "YEAR")}
  ${compare(original_language, correctAnswer.original_language, "LANGUAGE")}
  ${compare(revenue, correctAnswer.revenue, "REVENUE")}
  ${compare(director, correctAnswer.director, "DIRECTOR")}
  ${compare(popularity, correctAnswer.popularity, "POPULARITY")}
  ${compare(actorWithHighestPopularity, correctAnswer.actors, "ACTOR")}
  ${compare(genres, correctAnswer.genres, "GENRES")}
 
</div>
 </div></div>`
}

// gets a JSON obj and creates suggestions below searchBar
function createSuggestions(suggestionsObj) {
  if (suggestionsObj) {
    console.log('here: ' + suggestionsObj[0].Title);
    const suggestions = suggestionsObj.map(element =>
      `<div class=" suggestion" movieid="${element.id}">${element.Title}</div>`).join('');
    return `<div id="suggestionsContainer">${suggestions}</div>`;
  } else {
    return
  }
}

// adds EventListener to each suggestion to search when clicked by user
function renderSuggestions(suggestionsObj) {
  
  const suggestions = createSuggestions(suggestionsObj);
  elements.suggestions = $(suggestions);

  elements.suggestions.on('click', function (event) {
    // Get the text of the clicked suggestion
    const suggestionText = $(event.target).text();
    const suggestionId = $(event.target).attr('movieid');
    console.log(suggestionId);
    tryCounter++;

    if (elements.counter) {
      elements.counter.remove();
    }
    // Create the score counter element
    elements.counter = $(createScoreCounter());

    // Append the score counter after the #searchSection element
    elements.app.find('#homeMenu').after(elements.counter);

    // Set the value of the search bar to the clicked suggestion
    elements.app.find('#searchBar').val(suggestionText);

    // Remove existing suggestions
    elements.app.find('#suggestionsContainer').empty();

    // Trigger a search based on the clicked suggestion
    // Assuming you have a function to handle the search
    //handlers.getFilm(suggestionId);

    render(getFilm(suggestionId));

  });
  elements.app.find('#searchBar').nextAll().remove();
  elements.app.find('#searchSection').append(elements.suggestions);

}

// a function to render a single film, cleaning any previous film card 
function renderFilm(film) {
  elements.filmCard = $(createFilmCard(film));
  elements.app.find('#searchSection').after(elements.filmCard);
}

// adds EventListeners to searchBar element
function renderSearchBar(eventName) {
  
  // checking if the element already exists OR if there is no handler with that name (just because I don't want to render a button without a handler)
  if (elements[eventName] || !handlers[eventName]) {
    return;
  }

  elements[eventName] = $(createInput());

  elements[eventName].focus();

  let suggestions = [];
  // Add event listener for the 'input' event
  elements[eventName].on('input', function (event) {
    const inputValue = event.target.value;
    suggestions = handlers[eventName](inputValue);
    // Call your function to fetch autocomplete suggestions passing the input value
    console.log('suggestions are: ' + suggestions)
  });

  // Add event listener for the 'Enter key' event
  elements[eventName].on('keypress', function (event) {
    // Check if the key pressed is Enter (key code 13)
    if (event.which === 13) {
      try {
        console.log('HERE' + event.target.value)

        render(getFilm(suggestions[0].id));

      } catch (error) {
        console.error('Error while searching films:', error);
      }
      elements.app.find('#searchBar').nextAll().remove();
    }
  });

  elements.app.append(elements[eventName]);
}

// an exposed function for the service to give us a handler function to bind to an event
export function bind(eventName, handler) {
  handlers[eventName] = handler;
  console.log(handlers);
}

// the render function, which will trigger the rendering of the button firstly
// in this version, this is the function where one decides what will be rendered
export async function render(data) {
  elements.app = $("#app");
  console.log(elements)
  renderSearchBar("searchFilms");
  if (!data) {
    console.log('data is: ' + data)
    return;
  } else if (Array.isArray(data)) {
    console.log('data1 is: ' + data);
    const resolvedData = await Promise.all(data); // Wait for all promises to resolve
    renderSuggestions(resolvedData);
  } else {
    console.log('data2 is: ' + data);
    const resolvedData = await data; // Wait for the single promise to resolve
    renderFilm(resolvedData);
  }
};
