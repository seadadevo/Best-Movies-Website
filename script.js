const container = document.querySelector(".container");
const input = document.querySelector("input");
const API_URL =
  "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API =
  'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query="';

  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const pageDisplay = document.getElementById("page");

  let currentPage = 1;
  let totalPages = 1;
  let currentApiUrl = API_URL;

  function createPlaceholder(count) {
    let placeholder = "";
    for (let i = 0; i < count; i++) {
      placeholder += `
        <div class = "animation-pulse bg-gray-800 p-4 rounded shadow-md">
           <div class="h-60 bg-gray-700 rounded mb-4"></div>
        <div class="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      `
    }
    return placeholder;
  }
const getMovies = async (Api) => {
  // container.innerHTML = "Loading...";
  container.innerHTML = createPlaceholder(12)
  try {
    const res = await fetch(Api);
    const data = await res.json();
    const movies = data.results;
    totalPages = data.total_pages > 500 ? 500 : data.total_pages; 
    container.innerHTML = "";
      
    if (movies.length === 0) {
         container.innerHTML = "<p class='text-white text-center col-span-full'>No movies found</p>";
         return;
       }
  
    movies.sort((a, b) => b.vote_average - a.vote_average);
  
    displayMovies(movies);
  
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    pageDisplay.textContent = currentPage;
  } catch (error) {
    console.error("Error fetching movies:", error);
    container.innerHTML = "<p class='text-white text-center col-span-full'>Error loading movies</p>";
  }
 
};

const displayMovies = (movies) => {
  container.innerHTML = ""; 

  movies.forEach((movie) => {
    const movieEl = document.createElement("div");

    movieEl.className =
      "movie overflow-hidden relative pb-[20px] w-[300px] h-[520px] bg-[#373b69] rounded-[5px] flex flex-col group items-center gap-[10px] text-[#fff] cursor-pointer";

    movieEl.innerHTML = ` 
      <div>
        <img class="width-[200px] max-w-full rounded-[5px]" src="${
          IMG_PATH + movie.poster_path
        }" alt="${movie.title}" />
        <div class="p-[10px] flex items-center w-full gap-[10px] justify-between">
          <h2 class="text-[18px] font-bold">${movie.title}</h2>
          <p class="${getRatingColor(movie.vote_average)
          } bg-[#22254b] p-[5px] rounded-[5px]">${movie.vote_average.toFixed(
      1
    )}</p>
        </div>
        <div class=" p-[10px] w-full text-black bg-white absolute  bottom-[-200%] group-hover:bottom-[0] duration-300">
          <p class="mb-[10px] font-bold text-[22px]">Overview</p>
          <p class="text-[18px] font-semibold">${movie.overview}</p>
        </div>
      </div>
    `;

    movieEl.addEventListener("click", () => {
      showMovieDetails(movie.id);
    });

    container.appendChild(movieEl);
  });
};

const getRatingColor = (rate) => {
  if (rate > 8) return "text-green-500";
  if (rate > 6) return "text-orange-500";
  return "text-red-500";
};

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    getMovies(`${currentApiUrl}${currentPage}`);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    getMovies(`${currentApiUrl}${currentPage}`);
  }
});



input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const searchTerm = e.target.value.trim();
    if (searchTerm === "") {
      currentApiUrl = `${API_URL}`;
      getMovies(`${API_URL}1`);
    } else if (searchTerm.toLowerCase() === "sex") {
      container.innerText = "You can't search by that term";
    } else {
      currentApiUrl = `${SEARCH_API}${encodeURIComponent(searchTerm)}&page=`;
      getMovies(`${SEARCH_API}${encodeURIComponent(searchTerm)}&page=1`);
    }
    currentPage = 1;
  }
});

getMovies(API_URL);


const movieModal = document.getElementById('movieModal');
const movieDetails = document.getElementById('movieDetails');
const modalClose = document.getElementById('modalClose');

const showMovieDetails = async (movieId) => {
  const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=3fd2be6f0c70a2a598f084ddfb75487c&append_to_response=credits,videos`;

  try {
    // movieDetails.innerHTML = '<div class="text-white text-center py-10">Loading...</div>';
    movieDetails.innerHTML = createPlaceholder(1)
    movieModal.classList.remove('hidden');
     // ! Prevent scrolling
    document.body.style.overflow = 'hidden';
    
    const res = await fetch(detailsUrl);
    const movie = await res.json();
    console.log(movie);
    
    // Format runtime of the file
    const runtime = movie.runtime ? 
      `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 
      'N/A';
    
    // Get director
    const director = movie.credits.crew.find(person => person.job === 'Director');
    
    // Get main actors (first 5)
    const actors = movie.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
    
    // Get trailer (first YouTube video)
    const trailer = movie.videos.results.find(video => 
      video.site === 'YouTube' && video.type === 'Trailer'
    );
    
    movieDetails.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6 text-white">
        <div class="w-full md:w-1/3">
          <img class="w-full rounded-lg" src="${IMG_PATH + (movie.poster_path || '')}" 
               alt="${movie.title}" 
               onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'"/>
          ${trailer ? `
            <a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" 
               class="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
              <i class="fab fa-youtube mr-2"></i> Watch Trailer
            </a>
          ` : ''}
        </div>
        
        <div class="w-full md:w-2/3">
          <h2 class="text-3xl font-bold mb-2">${movie.title} 
            <span class="text-gray-400">(${new Date(movie.release_date).getFullYear()})</span>
          </h2>
          
          <div class="flex flex-wrap gap-2 mb-4">
            ${movie.genres.map(genre => `
              <span class="bg-[#22254b] px-3 py-1 rounded-full text-sm">${genre.name}</span>
            `).join('')}
            
            <span class="flex items-center ${
            getRatingColor(movie.vote_average)} bg-[#22254b] px-3 py-1 rounded-full text-sm">
              ${movie.vote_average.toFixed(1)}
            </span>
            
            <span class="bg-[#22254b] px-3 py-1 rounded-full text-sm">${runtime}</span>
          </div>
          
          <h3 class="text-xl font-semibold mb-2">Overview</h3>
          <p class="mb-4">${movie.overview || "No overview available."}</p>
          
          ${director ? `
            <p class="mb-1"><span class="font-semibold">Director:</span> ${director.name}</p>
          ` : ''}
          
          ${actors ? `
            <p class="mb-1"><span class="font-semibold">Cast:</span> ${actors}</p>
          ` : ''}
          
          ${movie.production_companies?.length > 0 ? `
            <p class="mb-1"><span class="font-semibold">Production:</span> 
              ${movie.production_companies.slice(0, 3).map(company => company.name).join(', ')}
            </p>
          ` : ''}
          
          ${movie.budget > 0 ? `
            <p class="mb-1"><span class="font-semibold">Budget:</span> 
              $${movie.budget.toLocaleString()}
            </p>
          ` : ''}
          
          ${movie.revenue > 0 ? `
            <p class="mb-1"><span class="font-semibold">Revenue:</span> 
              $${movie.revenue.toLocaleString()}
            </p>
          ` : ''}
          
          ${movie.homepage ? `
            <a href="${movie.homepage}" target="_blank" class="text-[#FFD700] hover:underline inline-block mt-4">
              Official Website
            </a>
          ` : ''}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error loading movie details:", error);
    movieDetails.innerHTML = '<div class="text-white text-center py-10">Error loading movie details</div>';
  }
};


modalClose.addEventListener('click', () => {
  movieModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
});


const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.remove("hidden");
  } else {
    backToTopBtn.classList.add("hidden");
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});