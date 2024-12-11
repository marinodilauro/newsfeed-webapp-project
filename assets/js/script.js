// API variables
const API_KEY = '4a4ef5e334824ef789104f7876e4ea2a';
const BASE_URL = 'https://newsapi.org/v2/everything';
const TOP_HEADLINES_URL = 'https://newsapi.org/v2/top-headlines';

// Categories Configuration
const NEWS_CATEGORIES = [
  { name: 'Technology', icon: 'laptop', category: 'technology' },
  { name: 'Sports', icon: 'football-ball', category: 'sports' },
  { name: 'Business', icon: 'chart-line', category: 'business' },
  { name: 'Entertainment', icon: 'film', category: 'entertainment' },
  { name: 'Health', icon: 'heartbeat', category: 'health' },
  { name: 'Science', icon: 'flask', category: 'science' },
  { name: 'General', icon: 'newspaper', category: 'general' }
];

// DOM Elements
const categoryButtonsContainer = document.getElementById('category-buttons');
const articlesContainer = document.getElementById('articles-container');
const loadingIndicator = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const articleModal = new bootstrap.Modal(document.getElementById('articleDetailsModal'));
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Initialize Categories Dynamically
function initializeCategories() {
  categoryButtonsContainer.innerHTML = NEWS_CATEGORIES.map(category => `
        <button type="button" class="btn btn-outline-primary" data-category="${category.category}">
            <i class="fas fa-${category.icon}"></i> ${category.name}
        </button>
    `).join('');
}

// Event Listeners
function addEventListeners() {
  categoryButtonsContainer.addEventListener('click', handleCategorySelection);
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize categories
  initializeCategories();

  // Add event listeners
  addEventListeners();

  const savedCategory = sessionStorage.getItem('selectedCategory');
  if (savedCategory) {
    fetchNews(savedCategory);
    highlightActiveCategory(savedCategory);
  } else {
    // Fetch general top headlines if no saved category
    fetchTopHeadlines();
  }
});

function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    displayError('Please enter a search term');
    return;
  }
  fetchNewsByKeyword(query);
}

function handleCategorySelection(event) {
  const categoryButton = event.target.closest('[data-category]');
  if (!categoryButton) return;

  const category = categoryButton.dataset.category;
  fetchNews(category);
  highlightActiveCategory(category);

  // Save to sessionStorage
  sessionStorage.setItem('selectedCategory', category);

  // Clear search input
  searchInput.value = '';
}

function highlightActiveCategory(activeCategory) {
  const buttons = categoryButtonsContainer.querySelectorAll('[data-category]');
  buttons.forEach(button => {
    button.classList.toggle('active', button.dataset.category === activeCategory);
  });
}

async function fetchTopHeadlines() {
  try {
    loadingIndicator.classList.remove('d-none');
    errorContainer.classList.add('d-none');
    articlesContainer.innerHTML = '';

    const response = await fetch(`${TOP_HEADLINES_URL}?country=us&apiKey=${API_KEY}`);

    if (!response.ok) {
      throw new Error('Failed to fetch top headlines');
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

async function fetchNewsByKeyword(query) {
  try {
    // Show loading indicator
    loadingIndicator.classList.remove('d-none');
    errorContainer.classList.add('d-none');
    articlesContainer.innerHTML = '';

    const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&apiKey=${API_KEY}`);

    if (!response.ok) {
      throw new Error('Failed to fetch news by keyword');
    }

    const data = await response.json();

    // Clear any active category highlights
    const buttons = categoryButtonsContainer.querySelectorAll('[data-category]');
    buttons.forEach(button => button.classList.remove('active'));

    displayNews(data.articles);
  } catch (error) {
    displayError('Unable to fetch news. Please check your connection.');
    console.error('News search error:', error);
  } finally {
    loadingIndicator.classList.add('d-none');
  }
}

async function fetchNews(category) {
  try {
    // Show loading indicator
    loadingIndicator.classList.remove('d-none');
    errorContainer.classList.add('d-none');
    articlesContainer.innerHTML = '';

    const response = await fetch(`${TOP_HEADLINES_URL}?category=${category}&country=us&apiKey=${API_KEY}`);

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
    displayError('No articles found.');
    return;
  }

  articles.slice(0, 12).forEach(article => {
    const cardHTML = `
            <div class="col-md-4">
                <div class="card article-card d-flex flex-column" data-bs-toggle="modal" data-bs-target="#articleDetailsModal">
                    <img src="${article.urlToImage || 'https://via.placeholder.com/350x200'}" 
                         class="card-img-top article-image" alt="${article.title}">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text flex-fill">${truncateText(article.description, 100)}</p>
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

function showArticleDetails(article) {
  const modalTitle = document.getElementById('modalArticleTitle');
  const modalContent = document.getElementById('modalArticleContent');

  modalTitle.textContent = article.title;
  modalContent.innerHTML = `
        <img src="${article.urlToImage || 'https://via.placeholder.com/800x400'}" 
             class="img-fluid mb-3" alt="${article.title}">
        <p>${article.description}</p>
        <p>${article.content || 'No additional content available.'}</p>
        <a href="${article.url}" target="_blank" class="btn btn-primary">Read Full Article</a>
    `;
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