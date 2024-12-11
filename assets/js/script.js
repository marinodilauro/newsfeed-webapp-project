const API_KEY = '4a4ef5e334824ef789104f7876e4ea2a';
const BASE_URL = 'https://newsapi.org/v2/top-headlines';


// DOM Elements
const categoryButtons = document.getElementById('category-buttons');
const articlesContainer = document.getElementById('articles-container');
const loadingIndicator = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const articleModal = new bootstrap.Modal(document.getElementById('articleDetailsModal'));

// Event Listeners
categoryButtons.addEventListener('click', handleCategorySelection);


document.addEventListener('DOMContentLoaded', () => {
  const savedCategory = sessionStorage.getItem('selectedCategory');
  if (savedCategory) {
    fetchNews(savedCategory);
    highlightActiveCategory(savedCategory);
  }
});

function handleCategorySelection(event) {
  const categoryButton = event.target.closest('[data-category]');
  if (!categoryButton) return;

  const category = categoryButton.dataset.category;
  fetchNews(category);
  highlightActiveCategory(category);

  // Save to sessionStorage
  sessionStorage.setItem('selectedCategory', category);
}

function highlightActiveCategory(activeCategory) {
  const buttons = categoryButtons.querySelectorAll('[data-category]');
  buttons.forEach(button => {
    button.classList.toggle('active', button.dataset.category === activeCategory);
  });
}

async function fetchNews(category) {
  try {
    // Show loading indicator
    loadingIndicator.classList.remove('d-none');
    errorContainer.classList.add('d-none');
    articlesContainer.innerHTML = '';

    const response = await fetch(`${BASE_URL}?category=${category}&country=us&apiKey=${API_KEY}`);

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();
    displayNews(data.articles);
  } catch (error) {
    displayError('Unable to fetch news. Please check your connection.');
    console.error('News fetch error:', error);
  } finally {
    loadingIndicator.classList.add('d-none');
  }
}

function displayNews(articles) {
  if (!articles || articles.length === 0) {
    displayError('No articles found for this category.');
    return;
  }

  articles.slice(0, 12).forEach(article => {
    const cardHTML = `
            <div class="col-md-4">
                <div class="card article-card" data-bs-toggle="modal" data-bs-target="#articleDetailsModal">
                    <img src="${article.urlToImage || 'https://via.placeholder.com/350x200'}" 
                         class="card-img-top article-image" alt="${article.title}">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${truncateText(article.description, 100)}</p>
                        <small class="text-muted">Source: ${article.source.name}</small>
                    </div>
                </div>
            </div>
        `;
    articlesContainer.insertAdjacentHTML('beforeend', cardHTML);
  });

  // Add click event to show full article details
  const articleCards = articlesContainer.querySelectorAll('.article-card');
  articleCards.forEach((card, index) => {
    card.addEventListener('click', () => showArticleDetails(articles[index]));
  });
}

function displayError(message) {
  errorContainer.textContent = message;
  errorContainer.classList.remove('d-none');
}

function truncateText(text, length) {
  return text && text.length > length
    ? text.substring(0, length) + '...'
    : text || 'No description available.';
}