let film;
/* {
  title: "Star Wars",
  year: 1977,
  director: "George Lucas",
  imdbRating: 8.6,
},
 */
let idToSearch = '522249';
let apiKey = '56d7c26f1c34ff059865b7b6691f1dfc';

async function getCredits(id) {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmQ3YzI2ZjFjMzRmZjA1OTg2NWI3YjY2OTFmMWRmYyIsInN1YiI6IjY2MTljZTIwNjllYjkwMDE2M2I3NTgyMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sjdfZEmPvZQTV3kKlkCwFlN0UrN-q96L_cgzDDXpn-I'
    }
  };

  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`, options);
    const data = await response.json();

    console.log('data is:' + data);
    return data;
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
}


export async function getRandomMovie() {
  /*  --request GET \
      --url 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_count.asc&vote_average.gte=8&vote_count.gte=1000' \
      --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmQ3YzI2ZjFjMzRmZjA1OTg2NWI3YjY2OTFmMWRmYyIsInN1YiI6IjY2MTljZTIwNjllYjkwMDE2M2I3NTgyMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sjdfZEmPvZQTV3kKlkCwFlN0UrN-q96L_cgzDDXpn-I' \
      --header 'accept: application/json' */


  const api = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=vote_count.asc&vote_average.gte=${(Math.random() * 2) + 6}&vote_count.gte=${Math.floor(Math.random() * (35000 - 2000 + 1)) + 2000}`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmQ3YzI2ZjFjMzRmZjA1OTg2NWI3YjY2OTFmMWRmYyIsInN1YiI6IjY2MTljZTIwNjllYjkwMDE2M2I3NTgyMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sjdfZEmPvZQTV3kKlkCwFlN0UrN-q96L_cgzDDXpn-I'
    }
  };
  try {
    const response = await fetch(api, options);
    const body = await response.json();


    if (!response.ok) {
      console.log('API Error:', body.message);
      throw new Error(body.message);
    }
    console.log(body.Response);

    console.log('API Response getRandom:', body);
    // Decode HTML entities in the fetched questions
    let output = await getFilm(body.results[0].id);
    console.log('Output is: ' + output)
    let credits = await getCredits(output.id);
    const directors = credits.crew.filter(member => member.job === "Director");
    const actors = credits.cast.filter(member => member.known_for_department === "Acting");
    console.log('actors are:' + actors);
    if (actors.length > 0) {
      const actorWithHighestPopularity = actors.reduce((prevActor, currentActor) => {
        return (prevActor.popularity > currentActor.popularity) ? prevActor : currentActor;
      });

      console.log("Actor with highest popularity:", actorWithHighestPopularity);
      output.actor = actorWithHighestPopularity.name;
      console.log('Actor is: ' + actorWithHighestPopularity.name)
    } else {
      console.log("No actors found in the 'Acting' department.");
    }
    output.director = directors;


  
    console.log('Director is: ' + output.director[0].name);
    return output;

  } catch (error) {
    //resetToken();
    console.error('Fetch Error:', error);
    throw error;
  }


}


let autoCompleteSuggestions = [];

async function fetchCardSearch(searchTerm) {
  const api = `https://api.themoviedb.org/3/search/movie?query=${searchTerm}&include_adult=false&language=en-US&page=1'`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmQ3YzI2ZjFjMzRmZjA1OTg2NWI3YjY2OTFmMWRmYyIsInN1YiI6IjY2MTljZTIwNjllYjkwMDE2M2I3NTgyMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sjdfZEmPvZQTV3kKlkCwFlN0UrN-q96L_cgzDDXpn-I'
    }
  };
  try {
    const response = await fetch(api, options);
    const body = await response.json();
    console.log('API ok:', body.results);

    if (!response.ok) {
      console.log('API Error:', body.message);
      throw new Error(body.message);
    }

    // Decode HTML entities in the fetched questions
    autoCompleteSuggestions = [];
    for (var i = 0; i < 5; i++) {
      autoCompleteSuggestions.push({
        Title: body.results[i].title,
        id: body.results[i].id
      })
    }
    return autoCompleteSuggestions; // Return the autocomplete suggestions
  } catch (error) {
    //resetToken();
    console.error('Fetch Error:', error);
    throw error;
  }
}

async function fetchCardById(id) {
  const api = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NmQ3YzI2ZjFjMzRmZjA1OTg2NWI3YjY2OTFmMWRmYyIsInN1YiI6IjY2MTljZTIwNjllYjkwMDE2M2I3NTgyMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sjdfZEmPvZQTV3kKlkCwFlN0UrN-q96L_cgzDDXpn-I'
    }
  };
  try {
    const response = await fetch(api, options);
    const body = await response.json();


    if (!response.ok) {
      console.log('API Error:', body.message);
      throw new Error(body.message);
    }
    console.log(body.Response);
    if (body.Response === "False" || body.imdbRating === "N/A" || body.imdbRating < 7 || body.year < 1990) {

      fetchCardById();
    }
    console.log('API Response:', body);
    // Decode HTML entities in the fetched questions

    film = body;

    let credits = await getCredits(id);
    const directors = credits.crew.filter(member => member.job === "Director");
    const actors = credits.cast.filter(member => member.known_for_department === "Acting");
    console.log('actors are:' + actors);
    if (actors.length > 0) {
      const actorWithHighestPopularity = actors.reduce((prevActor, currentActor) => {
        return (prevActor.popularity > currentActor.popularity) ? prevActor : currentActor;
      });

      console.log("Actor with highest popularity:", actorWithHighestPopularity);
      film.actor = actorWithHighestPopularity.name;
      console.log('Actor is: ' + actorWithHighestPopularity.name)
    } else {
      console.log("No actors found in the 'Acting' department.");
    }
    film.director = directors;


  
    console.log('Director is: ' + film.director[0].name);
    


    console.log('film is: ', film);

  } catch (error) {
    //resetToken();
    console.error('Fetch Error:', error);
    throw error;
  }
}



export function searchFilms(input) {
  fetchCardSearch(input);
  return autoCompleteSuggestions;
}

export async function getFilm(filmId) {
  console.log('film id is:' + filmId);
  await fetchCardById(filmId);
  console.log('film is here: ' + film)
  return film;
}
