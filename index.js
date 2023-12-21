const apiKey = 'f53fc1fa'
let listOfSearchFilms = []
let watchlistArray = [];

const main = document.getElementById('main')
const mainWatchlist = document.getElementById('main-watchlist')
const inputFilm = document.getElementById('search')
const submitButton = document.getElementById('submit-button')
const filmItemContainer = document.getElementById('film-item-container')


// Створюємо фільм-лист якщо його не було створено раніше 
window.onload = function () {
    if (localStorage.getItem('Watchlist') === null) {
        localStorage.setItem('Watchlist', '[]')
    }
    watchlistArray = JSON.parse(localStorage.getItem("Watchlist"));
    renderMyList()
}



// Пошук вільмів та їх загрузка на сторінці
async function searchAndRenderFilms(userKeyword) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(userKeyword)}&apikey=${apiKey}&plot=full`);
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await res.json();
        const films = data.Search;

        // якщо не знайшли фільм
        if (!films) {
            filmItemContainer.innerHTML = '<p class="ghost-text">Unable to find what you’re looking for. Please try another search.</p>'
            throw new Error('No movies found');
        }

        // перемінна з кодами фільмів
        const filmsId = films.map((film) => film.imdbID)



        const fullInfoFilms = await Promise.all(
            filmsId.map(async (id) => {
                const fullInfo = await getFullInfoFilm(id)
                return fullInfo
            })
        );

        // зменшуємо кількість фільмів до 4
        const limitedFilms = fullInfoFilms.slice(0, 4);

        // вставляємо наші знайдені фільми до масиву 
        const htmlFilms = limitedFilms.map((film) => {
            const { Poster, Title, imdbRating, Runtime, Genre, Plot, imdbID } = film
            listOfSearchFilms.push({
                poster: Poster,
                title: Title,
                imdbRating: imdbRating,
                runtime: Runtime,
                genre: Genre,
                plot: Plot,
                imdbID: imdbID
            });


            // повертаємо готовий HTML код та рендеримо його
            return `
        <div class="film-card">
        <img class="poster-img" src="${Poster}" alt="Poster Film">
        <div class="film-info-container">
            <div class="title-film">
                <h2>${Title}</h2>
                <i class="star-item fa-solid fa-star"></i>
                <h3>${imdbRating}</h3>
            </div>
            <div class="time-ganre-info">
                <h3>${Runtime}</h3>
                <h3>${Genre}</h3>
                <button class="button-move-watchlist" id='${imdbID}'><i class="plus-minus-item fa-solid fa-plus"></i>Watchlist</button>
            </div>
            <div class="paragraph-container">
            <p class="film-text-info">${Plot}</p>
            </div>
        </div>
    </div>`
        })
        main.innerHTML = htmlFilms;

        // виводимо помилку в консоль
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// шукаємо повну інформацію про фільм по ID
async function getFullInfoFilm(id) {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`);
    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await res.json();
    return data;
}

// Button for search films
if (submitButton) {
    submitButton.addEventListener('click', function (e) {
        e.preventDefault()
        const inputValue = inputFilm.value.trim();
        if (inputValue !== '') {
            searchAndRenderFilms(inputValue);
        }
    })
}


// Adding the movie to the localStorage
function addFilmToLocalStorage(film) {
    watchlistArray.push(film);
    localStorage.setItem('Watchlist', JSON.stringify(watchlistArray));
}

// 
document.addEventListener('click', function (e) {
    if (listOfSearchFilms && e.target.id) {
        const imdbID = e.target.id;

        // Check if there is a movie with the same imdb ID in the localStorage
        const isFilmInWatchlist = watchlistArray.some((film) => film.imdbID === imdbID);

        if (!isFilmInWatchlist) {
            const film = listOfSearchFilms.find((film) => film.imdbID === imdbID);
            if (film) {
                document.getElementById(imdbID).textContent = '(ADDED!)';
                addFilmToLocalStorage(film);
            }
        }
    }
});

function removeFilmFromWatchlist(imdbID) {
    const updatedWatchlist = watchlistArray.filter((film) => film.imdbID !== imdbID);
    watchlistArray = updatedWatchlist;
    localStorage.setItem('Watchlist', JSON.stringify(watchlistArray));
}

function renderMyList() {
    if (mainWatchlist && watchlistArray.length) {
        const watchlistHtml = watchlistArray.map((film) => {
            const { poster, title, imdbRating, runtime, genre, plot, imdbID } = film;
            return `
          <div class="film-card">
            <img class="poster-img" src="${poster}" alt="Poster Film">
            <div class="film-info-container">
              <div class="title-film">
                <h2>${title}</h2>
                <i class="star-item fa-solid fa-star"></i>
                <h3>${imdbRating}</h3>
              </div>
              <div class="time-ganre-info">
                <h3>${runtime}</h3>
                <h3>${genre}</h3>
                <button class="button-move-watchlist" id="${imdbID}"><i class="plus-minus-item fa-solid fa-minus"></i>Remove</button>
              </div>
              <div class="paragraph-container">
                <p class="film-text-info">${plot}</p>
              </div>
            </div>
          </div>`;
        });
        mainWatchlist.innerHTML = watchlistHtml;

        // Добавьте обработчики событий для кнопок "Remove"
        const removeButtons = document.querySelectorAll('.button-move-watchlist');
        removeButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                const imdbIDToRemove = e.target.id;
                removeFilmFromWatchlist(imdbIDToRemove);
                renderMyList();
            });
        });
    } else if (mainWatchlist) {
        mainWatchlist.innerHTML = `        
        <div class="film-item-container">
            <p class="ghost-text">Your watchlist is looking a little empty...</p>
            <a class="a-margin" href="index.html"><i class="plus-minus-item fa-solid fa-plus"></i>Let’s add some movies!</a>

        </div>`
    }
}







