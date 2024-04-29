import { bind, render } from "./../views/film-view.js";
import { getFilm, searchFilms } from "./../services/film-service.js";

// binds a handler function to a given event name
// these events will be associated with button click, and thus trigger the getFilmHandler function  
// this means that the "getFilm" must be used both for the handler name AND button element name.
function bindEventHandlers() {
  bind("getFilm", getFilmHandler);
  bind("searchFilms", searchFilmsHandler);
  render();
}


// a function to get a random film and render it. 
//Notice that getFilm is a service function while render is a view function.
function getFilmHandler(data) {
  render(getFilm(data));
}


function searchFilmsHandler() {
  const input = $('#searchBar').val(); // Get the input value from the search bar
  const suggestions = searchFilms(input); // Fetch autocomplete suggestions
  render(suggestions); // Render autocomplete suggestions
}
// do the binding for the getFilmHandler
// and start the controller, triggering render first time, without a film argument
export function start() {
  bindEventHandlers();
  
}
