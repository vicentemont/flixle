// the point of separating elements from their handlers is flexibility
// I may want elements without any handling functions
import { persistAnswer, getCurrentAnswer, today, isSameDay, alreadyExistsOnFirebase } from "../services/firebase.js";
import { getFilm, searchFilms, getRandomMovie, startTimer } from "../services/film-service.js";
// and I may want handlers that are shared by multiple elements
const elements = {};
const handlers = {};

let guesses = [];
let dayWasChecked = false;

let gameOver = false;
let gameWon = false;
let tryCounter = 0;
let playLimitless = false;

let menuOpen = false;
let correctAnswer;

let displayConsoleLogs = false;




async function renderMovieArray(array) {
  for (const id of array) {  // Use 'for...of' to handle asynchronous operations
    const movie = await getFilm(id);  // Get the movie asynchronously
    if (displayConsoleLogs) {
      console.log('Got movie,', movie);
    }
    await render(movie);  // Render the movie after it's fetched
  }
}

function checkDay() {
  if (dayWasChecked) {
    return
  }
  const lastPlay = new Date(localStorage.getItem('last play'));
  if (!isSameDay(today, lastPlay)) {
    localStorage.clear();
  } else {
    let usedMovies = JSON.parse(localStorage.getItem('guesses'));
    tryCounter = usedMovies.length;

    if (elements.counter) {
      elements.counter.remove();
    }
    // Create the score counter element
    elements.counter = $(createScoreCounter());

    // Append the score counter after the #searchSection element
    elements.app.find('#homeMenu').after(elements.counter);

    renderMovieArray(usedMovies);

  }
  dayWasChecked = true;
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

function checkIfNumberIsNear(numToCompare, num) {
  if (numToCompare === num) {
    return `background-color: #1ed760d9;` //Green
  } else if (numToCompare > 100000) {
    if (numToCompare < num + 100000000 && numToCompare > num - 100000000) { //If its a Budget
      return `background-color: #ffa500d6;` //Orange;
    }else {
      return `background-color: rgba(255, 0, 0, 0.8);` //Red
    }
  } else if (numToCompare > 1500) {
    if (numToCompare < num + 5 && numToCompare > num - 5) { //If its a Date
      return `background-color: #ffa500d6;` //Orange;
    }else {
      return `background-color: rgba(255, 0, 0, 0.8);` //Red
    }
  } else if (numToCompare > 10) {
    if (numToCompare < num + 20 && numToCompare > num - 20) { //If its a Popularity
      return `background-color: #ffa500d6;` //Orange;
    }else {
      return `background-color: rgba(255, 0, 0, 0.8);` //Red
    }
  } else if (numToCompare < num + 20) {
    if (numToCompare > num - 20) { //If its a Rating
      return `background-color: #ffa500d6;` //Orange;
    }else {
      return `background-color: rgba(255, 0, 0, 0.8);` //Red
    }
  } else {
    return `background-color: rgba(255, 0, 0, 0.8);` //Red
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
      return `
          <div id="${title}" class="movieDetail" style="background-color: #1ed760d9; ${dynamicFontSize(param.name.length + 15)}"> 
              <p class="squareName">M.P.ACTOR</p>
              <div>
                  <span>${param.name.toUpperCase()} </span>
              </div> 
          </div>`;
    } else if (actorsIds.includes(param.id)) {
      return `
      <div id="${title}" class="movieDetail" style="background-color: #ffa500d6; ${dynamicFontSize(param.name.length + 15)}"> 
          <p class="squareName">M.P.ACTOR</p>
          <div>
              <span>${param.name.toUpperCase()} </span>
          </div> 
      </div>`
    } else {
      return `
          <div id="${title}" class="movieDetail" style="background-color: rgba(255, 0, 0, 0.8); ${dynamicFontSize(param.name.length + 15)}"> 
              <p class="squareName">M.P.ACTOR</p>
              <div>
                  <span>${param.name.toUpperCase()} </span>
              </div> 
          </div>`;
    }
  } else if (Array.isArray(param)) {
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
    <div id="${param}" class="movieDetail" style="${checkIfNumberIsNear(param1, param)}"> 
    <p class="squareName">${title}</p>
    <div>
    <span> ${roundNumber(param)} </span>
    </div> 
    </div>`;
  } else if (param > param1) {
    return `
    <div id="${param}" class="movieDetail" style="${checkIfNumberIsNear(param1, param)}"> 
    <p class="squareName">${title}</p>
    <div>
    <span>&darr; ${roundNumber(param)} </span>
    </div> 
    </div>`;
  } else if (param < param1) {
    return `
    <div id="${param}" class="movieDetail" style="${checkIfNumberIsNear(param1, param)}"> 
    <p class="squareName">${title}</p>
    <div>
    <span>&uarr;${roundNumber(param)}</span>
    </div> 
    </div>`;
  }

}

function increaseCounter() {
  tryCounter++;

  if (elements.counter) {
    elements.counter.remove();
  }
  // Create the score counter element
  elements.counter = $(createScoreCounter());

  // Append the score counter after the #searchSection element
  elements.app.find('#homeMenu').after(elements.counter);

}

function addGuessToLocalStorage(movieId) {
  guesses = JSON.parse(localStorage.getItem('guesses') || '[]');  // Default to an empty array if null
  guesses.push(movieId);
  localStorage.setItem('guesses', JSON.stringify(guesses));
  localStorage.setItem('last play', new Date());
}

async function getCorrectAnswer() {
  if (playLimitless) {
    try {
      if (!correctAnswer) {  // If it's null or undefined, generate a new answer
        correctAnswer = await getRandomMovie();  // Generate a new correct answer
        return correctAnswer;  // Use the current answer

      } else {
        return correctAnswer;  // Use the current answer
      }

    } catch (e) {
      console.error("Error in getCorrectAnswer:", e);
      throw e;  // Re-throw the error for handling in calling functions
    }
  } else {
    try {
      // Get the current answer asynchronously
      const currentAnswer = await getCurrentAnswer();

      if (!currentAnswer) {  // If it's null or undefined, generate a new answer
        if (displayConsoleLogs) {
          console.log("No current answer found. Generating a new correct answer...");
        }

        correctAnswer = await getRandomMovie();  // Generate a new correct answer
        while(await alreadyExistsOnFirebase(correctAnswer.id)){
          correctAnswer = await getRandomMovie();
        }
        persistAnswer(correctAnswer);  // Persist the new correct answer
      } else {
        if (displayConsoleLogs) {
          console.log("Current answer found:", currentAnswer);
        }
        correctAnswer = currentAnswer;  // Use the current answer
      }

      return correctAnswer;  // Return the correct answer (new or existing)
    } catch (e) {
      if (displayConsoleLogs) {
        console.error("Error in getCorrectAnswer:", e);
      }
      throw e;  // Re-throw the error for handling in calling functions
    }
  }
};

// a function to create a single button with some inner text
function createInput() {
  return `<div id="searchSection" class="container"><input autocomplete="off" type="search" id="searchBar" class="container" placeholder="Search movie..."></div>`;
}

function createQuitButton() {
  return `<div id="quit-button-container"><div id="quit-button"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0">
  <path d="m88.891 55c1.3906 1.668 1.668 3.8906 0.55469 5.832-0.83203 1.9453-2.7773 3.0547-5 3.0547l-68.891 0.003906v30.555c0 1.3906-1.3906 2.7773-2.7773 2.7773-1.3906 0-2.7773-1.3906-2.7773-2.7773v-88.891c0-1.3906 1.3906-2.7773 2.7773-2.7773h71.945c2.2227 0 4.168 1.1094 5 3.0547 0.83203 1.9453 0.55469 4.168-0.55469 5.832l-17.5 21.668z"/>
 </svg></div></div> `
}

function createSideMenu() {
  return `<div id="side-menu-container"><div id="side-menu-button"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0">
  <path d="m12.5 25c0-3.4531 2.7969-6.25 6.25-6.25h62.5c3.4531 0 6.25 2.7969 6.25 6.25s-2.7969 6.25-6.25 6.25h-62.5c-3.4531 0-6.25-2.7969-6.25-6.25zm68.75 18.75h-62.5c-3.4531 0-6.25 2.7969-6.25 6.25s2.7969 6.25 6.25 6.25h62.5c3.4531 0 6.25-2.7969 6.25-6.25s-2.7969-6.25-6.25-6.25zm0 25h-62.5c-3.4531 0-6.25 2.7969-6.25 6.25s2.7969 6.25 6.25 6.25h62.5c3.4531 0 6.25-2.7969 6.25-6.25s-2.7969-6.25-6.25-6.25z"/>
 </svg></div></div> `
}

function createConfimationButton(text, id) {
  return `<div id="${id}">${text}</div>`
}

function createConfirmationCard(title, text) {
  return `
  <div class="confirmation-card-container">
  <div id="confirmation-card-title">${title}</div>
  <div id="confirmation-card-text">${text}</div>
  <div id="confirmation-card-btn-container">
  </div>
  </div>
  `
}

function createWinScreen() {
  elements['searchFilms'].remove();
  delete elements.app.find('searchBar');
}

function createScoreCounter() {
  return `<div id="counter">
  <p >Number of tries: ${tryCounter}
  </p>
  </div>`
}

function rendeConfetti() {
  elements['confeetti'] = ``
}

function createGameOverCard(gameWinStatus, nrOfTries) {

  if (gameWinStatus === 'true') {
    return `
    <script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script> 

    <div id="lottie-animations">
    <dotlottie-player src="https://lottie.host/c59d99ba-4b8f-4a77-ba2b-e6045f774660/KTN91j6eVX.json" background="transparent" speed="1" loop autoplay></dotlottie-player>
    <dotlottie-player src="https://lottie.host/c59d99ba-4b8f-4a77-ba2b-e6045f774660/KTN91j6eVX.json" background="transparent" speed="1" loop autoplay></dotlottie-player>
    </div>
    <div class="game-over-card-container" ><div id="game-over-card"><h3>You Win! &#127881;</h3>You've won Flixle after ${nrOfTries} tries!<div id="game-over-card-btn-container"></div><div id="timer-text">New movie in: <p id="timer"></p></div></div></div>`
  } else {
    return `<div class="game-over-card-container" ><div id="game-over-card"><h3>You Surrended! &#127987</h3>You gave up on Flixle after ${nrOfTries} tries!<div id="game-over-card-btn-container"></div><div id="timer-text">New movie in: <p id="timer"></p></div></div></div>`

  }
}

function createWhatsappBtn(nrOfTries, gameWinStatus) {
  if (gameWinStatus === 'true') {
    return `<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
    <a href="https://api.whatsapp.com/send?text=I%C2%B4ve%20won%20Flixle%20after%20${nrOfTries}%20tries%21%20%F0%9F%8E%89%20%F0%9F%8E%89%20%F0%9F%8E%89%0ACan%20you%20beat%20me%3F%3F%20%F0%9F%A5%8A%20%F0%9F%A5%8A%0Ahttps%3A%2F%2Fflixle.eu" class="float" target="_blank">
    Share on Whatsapp <i class="fa fa-whatsapp my-float"></i>
    </a>`
  } else {
    return `<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
    <a href="https://api.whatsapp.com/send?text=I%20gave%20up%20on%20Flixle%20after%20${nrOfTries}%20tries%21%20%F0%9F%8F%B3%EF%B8%8F%20%F0%9F%8F%B3%EF%B8%8F%20%F0%9F%8F%B3%EF%B8%8F%0ACan%20you%20beat%20me%3F%3F%20%F0%9F%A5%8A%20%F0%9F%A5%8A%0Ahttps%3A%2F%2Fflixle.eu" class="float" target="_blank">
    Share on Whatsapp <i class="fa fa-whatsapp my-float"></i>
    </a>`
  }

}

// a function to create a film card, which is the html code for a single film
function createFilmCard({ id, title, popularity, genres, budget, actors, revenue, director, original_language, vote_average, origin_country, release_date, poster_path }) {

  const actorWithHighestPopularity = actors.reduce((prevActor, currentActor) => {
    return (prevActor.popularity > currentActor.popularity) ? prevActor : currentActor;
  });




  return `<div class="gameCardContainer container"><div id="gameCard" class="" style="background-image: url('https://image.tmdb.org/t/p/w500${poster_path}'); background-size: cover">
  <div>
  
  </div>
  <div id="movieTitle">
  <img src="https://image.tmdb.org/t/p/w500${poster_path}" alt="Description of the image" width="100" height="auto">
  <div><h3>${title}</h3></div>
  </div>
  <div id="movieDetails" >
  
  ${compare(Number(vote_average.toFixed(1)), Number(correctAnswer.vote_average.toFixed(1)), "TMDB")}
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
    // Convert the nested objects in suggestionsObj into an array
    const suggestionsArray = Object.values(suggestionsObj);

    // Retrieve 'guesses' from localStorage and ensure it's an array
    guesses = JSON.parse(localStorage.getItem('guesses') || '[]');  // Default to an empty array if null
    //console.log('guesses are:', guesses);  // Output the array of IDs

    // Find all suggestions that have matching IDs in 'guesses'
    let alreadyUsed = suggestionsArray.filter(suggestion =>
      guesses.some(guess => guess === suggestion.id)  // Check if 'guess' matches 'suggestion.id'
    );

    //console.log('alreadyUsed are:', alreadyUsed);  // Output the filtered suggestions

    // Check if there are any objects with matching IDs
    if (alreadyUsed.length > 0) {
      //console.log("An object with a matching ID was already searched.", alreadyUsed);
    } else {
      //console.log("No object with a matching ID found.");
    }

    function checkIfItsBeenUsed(elementId) {
      if (alreadyUsed.some(item => item.id === elementId)) {
        return `<span style="color: green;">&#10003;  </span>`
      } else {
        return ``;
      }
    }
    // Generate the suggestions as HTML
    const suggestions = suggestionsArray.map(suggestion =>
      `<div class="suggestion" movieid="${suggestion.id}"><div movieid="${suggestion.id}" id="suggestion-title">${checkIfItsBeenUsed(suggestion.id)}${suggestion.Title}</div> <div id="suggestion-year">${suggestion.year}</div></div>`
    ).join('');

    return `<div id="suggestionsContainer">${suggestions}</div>`;
  } else {
    return '';
  }
}




function renderConfirmationCard(eventName) {
  if (elements[eventName] || localStorage.length < 1) {
    return;
  }
  elements[eventName] = $(createConfirmationCard("Surrender?", "Do you really wish to know the correct movie?"));

  elements.app.append(elements[eventName]);
  elements["confirm-button"] = $(createConfimationButton("Yes, I quit!", "confirm-btn"));
  elements["disregard-button"] = $(createConfimationButton("No, go back!", "disregard-btn"))

  elements["confirm-button"].on('click', async () => {
    increaseCounter();
    gameWon = false;
    gameOver = true;
    localStorage.setItem('gameWon', 'false');
    localStorage.setItem('gameOver', 'true');
    addGuessToLocalStorage(correctAnswer.id);
    await render(correctAnswer);
    elements[eventName].remove();
    delete elements[eventName];
    createWinScreen();
    renderGameOverCard('gameOverCard1', 'false', tryCounter);

  })

  elements["disregard-button"].on('click', () => {
    elements[eventName].remove();
    delete elements[eventName];
  })

  elements[eventName].append(elements["confirm-button"]);
  elements[eventName].append(elements["disregard-button"]);
}

function renderGameOverCard(eventName, gameWinStatus, nrOfTries) {
  //console.log('entered renderGameOverCard')
  // checking if the element already exists OR if there is no handler with that name (just because I don't want to render a button without a handler)
  if (elements[eventName]) {
    return;
  }
  elements[eventName] = $(createGameOverCard(gameWinStatus, nrOfTries))

  elements['whatsappBtn'] = $(createWhatsappBtn(nrOfTries, gameWinStatus))


  elements.app.append(elements[eventName]);
  elements.app.find('#game-over-card-btn-container').append(elements['whatsappBtn']);
  startTimer();
}

function renderQuitButton(eventName) {
  if (elements[eventName]) {

    return;
  }
  elements[eventName] = $(createQuitButton());
  gameOver = localStorage.getItem('gameOver');
  elements[eventName].on('click', () => {
    if (gameOver) {
      return;
    } else {
      renderConfirmationCard("confirmation-card");

    }

  })

  // checking if the element already exists OR if there is no handler with that name (just because I don't want to render a button without a handler)


  elements.app.find("#side-menu-container").append(elements[eventName]);

}

function renderSideMenu(eventName) {
  if (elements[eventName]) {

    return;
  }
  elements[eventName] = $(createSideMenu());

  // checking if the element already exists OR if there is no handler with that name (just because I don't want to render a button without a handler)


  elements.app.prepend(elements[eventName]);
  elements[eventName].on('click', () => {
    if (menuOpen) {
      menuOpen = false;
      delete elements["quit-button"];
      elements.app.find("#quit-button").remove();
    } else {
      menuOpen = true;
      renderQuitButton("quit-button");
    }
  })

}

// adds EventListener to each suggestion to search when clicked by user
function renderSuggestions(suggestionsObj) {

  const suggestions = createSuggestions(suggestionsObj);
  elements.suggestions = $(suggestions);

  elements.suggestions.on('click', async function (event) {
    // Get the text of the clicked suggestion
    const suggestionText = $(event.target).text();
    const suggestionId = $(event.target).attr('movieid');
    if (displayConsoleLogs) {
      console.log(suggestionId);
    }

    increaseCounter();
    // Set the value of the search bar to the clicked suggestion
    elements.app.find('#searchBar').val(suggestionText);

    // Remove existing suggestions
    elements.app.find('#suggestionsContainer').empty();


    // Trigger a search based on the clicked suggestion
    // Assuming you have a function to handle the search
    let movie = await getFilm(suggestionId);
    guesses.push(movie.id);
    localStorage.setItem('guesses', JSON.stringify(guesses));
    localStorage.setItem('last play', new Date());
    //console.log("guesses so far: ", guesses);
    await render(movie);
    if (movie.id === correctAnswer.id) {
      gameWon = true;
      gameOver = true;
      localStorage.setItem('gameWon', 'true');
      localStorage.setItem('gameOver', 'true');
      createWinScreen();
      renderGameOverCard('gameOverCard1', 'true', tryCounter);
      if (displayConsoleLogs) {
        console.log('You win!');
      }
    }
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
  let gameState = localStorage.getItem('gameOver');


  // checking if the element already exists OR if there is no handler with that name (just because I don't want to render a button without a handler)
  if (elements[eventName] || !handlers[eventName]) {
    return;
  }

  elements[eventName] = $(createInput());

  let suggestions = [];
  // Add event listener for the 'input' event
  elements[eventName].on('input', function (event) {
    const inputValue = event.target.value;
    suggestions = handlers[eventName](inputValue);
    // Call your function to fetch autocomplete suggestions passing the input value
    if (displayConsoleLogs) {
      console.log('suggestions are: ' + suggestions)
    }
  });

  // Add event listener for the 'Enter key' event
  elements[eventName].on('keypress', function (event) {
    // Check if the key pressed is Enter (key code 13)
    if (event.which === 13) {
      try {

        render(getFilm(suggestions[0].id));

      } catch (error) {
        if (displayConsoleLogs) {
          console.error('Error while searching films:', error);
        }
      }
      elements.app.find('#searchBar').nextAll().remove();
    }
  });

  elements.app.append(elements[eventName]);
  let gameWinStatus = localStorage.getItem('gameWon');
  if (gameState === 'true') {
    elements.app.find('#searchBar').remove();
    renderGameOverCard('gameOverCard1', gameWinStatus, tryCounter);

  }

}

export { getCorrectAnswer, displayConsoleLogs }

// an exposed function for the service to give us a handler function to bind to an event
export function bind(eventName, handler) {
  handlers[eventName] = handler;
}

// the render function, which will trigger the rendering of the button firstly
// in this version, this is the function where one decides what will be rendered
export async function render(data) {

  elements.app = $("#app");
  checkDay();
  renderSearchBar("searchFilms");
  renderSideMenu("sideMenu");

  if (!data) {
    return;
  } else if (Array.isArray(data)) {
    const resolvedData = await Promise.all(data); // Wait for all promises to resolve
    renderSuggestions(resolvedData);
  } else {
    const resolvedData = await data; // Wait for the single promise to resolve
    renderFilm(resolvedData);
  }
};
