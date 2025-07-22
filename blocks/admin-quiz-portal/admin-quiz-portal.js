// State management
let currentView = 'dashboard';
let currentGame = null;
let games = [];
let filteredGames = [];
let mainContainer = null;
let leaderboardData = []; // New state for leaderboard data

// ===== STEP 1: DATA NORMALIZATION & LOGGING =====

// Helper function to normalize game data from API to UI format
function normalizeGameData(game) {
  console.log('🔧 Normalizing game data:', game);
  
  const normalized = {
    ...game,
    // Handle status field mapping (publishStatus -> status)
    status: game.publishStatus === true ? 'published' : 
            game.publishStatus === false ? 'draft' : 
            game.status || 'draft',
    
    // Ensure questions array exists and normalize each question
    questions: (game.questions || []).map(question => normalizeQuestionData(question)),
    
    // Ensure all required fields exist
    title: game.title || game.name || 'Untitled Game',
    description: game.description || 'No description available',
    tags: game.tags || [],
    startDate: game.startDate || null,
    endDate: game.endDate || null,
    updatedAt: game.updatedAt || game.lastModified || new Date().toISOString()
  };
  
  console.log('✅ Normalized game data:', normalized);
  return normalized;
}

// Helper function to normalize question data
function normalizeQuestionData(question) {
  console.log('🔧 Normalizing question data:', question);
  
  const normalized = {
    // Handle different field names for question ID
    questionId: question.questionId || question.id || `q${Date.now()}`,
    
    // Handle different field names for question type
    questionType: question.questionType || question.type || 'single-choice',
    
    // Handle different field names for question text
    questionText: question.questionText || question.text || '',
    
    // Ensure options array exists
    options: question.options || ['', ''],
    
    // Handle different field names for correct answers
    correctAnswer: question.correctAnswer || question.correctAnswers || [],
    
    // Ensure time limit exists
    timeLimit: question.timeLimit || 30,
  };
  
  console.log('✅ Normalized question data:', normalized);
  return normalized;
}

// Enhanced logging function for debugging
function logGameData(context, data) {
  console.log(`📊 [${context}] Game Data:`, {
    gameCount: Array.isArray(data) ? data.length : 1,
    sampleGame: Array.isArray(data) ? data[0] : data,
    questionsCount: Array.isArray(data) ? 
      data.map(g => ({ id: g._id, questions: g.questions?.length || 0 })) :
      { id: data._id, questions: data.questions?.length || 0 }
  });
}

const mockGames = [
  {
    id: "game_001",
    title: "Mathematics Basics",
    description: "Fundamental mathematics concepts including algebra, geometry, and arithmetic",
    tags: ["math", "education"],
    status: "published",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        text: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: [1],
        timeLimit: 30,
        order: 1
      }
    ],
    createdAt: "2024-01-15",
    lastModified: "2024-01-20"
  },
  {
    id: "game_002", 
    title: "Science Quiz",
    description: "General science questions covering physics, chemistry, and biology",
    tags: ["science", "education"],
    status: "draft",
    startDate: "2024-02-01",
    endDate: "2024-12-31",
    questions: [],
    createdAt: "2024-01-18",
    lastModified: "2024-01-19"
  }
];

// Initialize games
games = [...mockGames];
filteredGames = [...games];

// API Integration Hooks
const API = {
  async getAllGames() {
    console.log('GET /getAllGames');
    try {
      const response = await fetch('https://275323-116limecat-stage.adobeio-static.net/api/v1/web/KahootMongoApp/getAllGames');
      
      if (!response.ok) {
        console.log("getAllGames call failing");
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success && result.games) {
        return result.games;
      } else {
        console.error('Invalid response format:', result);
        return games; // fallback to local games
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      return games; // fallback to local games
    }
  },
  async getGame(gameId) {
    console.log('GET /getGame', gameId);
    try {
      const response = await fetch("https://275323-116limecat-stage.adobeio-static.net/api/v1/web/KahootMongoApp/getGameByID?id="+gameId);
      
      if (!response.ok) {
        throw new Error("HTTP error! in getGame");
      }
      
      const result = await response.json();
      console.log('Get Game API Response:', result);
      
      if (result.success && result.game) {
        return result.game;
      } else {
        console.error('Invalid game response format:', result);
        return null;
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      return null;
    }
  },  
  async addGame(gameData) {
    console.log('POST /addGame', gameData);
    
    // Generate a random ID for the new game
    const gameId = generateRandomId();
    const currentTime = new Date().toISOString();
    
    // Format the data according to your API structure
    const apiData = {
      _id: gameId,
      title: gameData.title || 'Untitled Game',
      description: gameData.description || 'No description available',
      status: gameData.status || 'draft',
      startDate: gameData.startDate || new Date().toISOString().split('T')[0],
      endDate: gameData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      questions: [],
      createdAt: currentTime,
      updatedAt: currentTime
    };
    
    try {
      const response = await fetch('https://275323-116limecat-stage.adobeio-static.net/api/v1/web/KahootMongoApp/addGame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error("HTTP error! in addGame ");
      }
      
      const result = await response.json();
      console.log('Create Game API Response:', result);
      
      if (result.success) {
        // Add to local games array for immediate UI update
        const newGame = {
          ...apiData,
          id: gameId,
          title: apiData.title,
          lastModified: currentTime
        };
        games.push(newGame);
        return newGame;
      } else {
        throw new Error(result.message || 'Failed to create game');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      
      // Fallback: create locally if API fails
      const newGame = {
        ...apiData,
        id: gameId,
        title: apiData.title,
        lastModified: currentTime
      };
      games.push(newGame);
      return newGame;
    }
  },
  
  async updateGame(gameId, completeGameData) {
    console.log('PUT /updateGame', { gameId, completeGameData });
    try {
      const response = await fetch(`https://275323-116limecat-stage.adobeio-static.net/api/v1/web/KahootMongoApp/updateGame`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeGameData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Update Game API Response:', result);
      
      if (result.success) {
        // Update local games array for immediate UI update
        const index = games.findIndex(game => game._id === gameId);
        if (index !== -1) {
          games[index] = {
            ...games[index],
            ...completeGameData,
            lastModified: new Date().toISOString()
          };
        }
        return games[index];
      } else {
        throw new Error(result.message || 'Failed to update game');
      }
    } catch (error) {
      console.error('Error updating game:', error);
      throw error; // Re-throw to be caught by saveGame
    }
  },
  
  async deleteGame(id) {
    console.log('DELETE /game/:id', id);
    const index = games.findIndex(game => game.id === id);
    if (index !== -1) {
      games.splice(index, 1);
      return true;
    }
    throw new Error('Game not found');
  },
  
  async publishGame(id, publish) {
    console.log('PATCH /game/:id/publish', { id, publish });
    const game = games.find(g => g.id === id);
    if (game) {
      game.status = publish ? 'published' : 'draft';
      game.lastModified = new Date().toISOString();
      return game;
    }
    throw new Error('Game not found');
  },

  
  async getGameLeaderboard(gameId) {
    console.log('GET /getGameLeaderboard', gameId);
    try {
      // First, get the specific game data to access the users array
      const response = await fetch(`https://275323-116limecat-stage.adobeio-static.net/api/v1/web/KahootMongoApp/getGameByID?id=${gameId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Game API Response:', result);
      
      if (result.success && result.game && result.game.users) {
        // Transform the users data to match our expected format
        const leaderboardData = result.game.users.map(user => ({
          name: user.userName,
          avatar: user.avatar || '👤', // Default avatar if empty
          score: parseInt(user.score) || 0,
          rank: parseInt(user.rank) || 0
        }));
        
        console.log('Transformed leaderboard data:', leaderboardData);
        return leaderboardData;
      } else {
        console.error('Invalid game response format or no users data:', result);
        // Return mock data for development/testing
        return generateMockLeaderboardData();
      }
    } catch (error) {
      console.error('Error fetching game leaderboard:', error);
      // Return mock data for development/testing
      return generateMockLeaderboardData();
    }
  }
};

// Helper functions
function generateRandomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to format date for HTML date input (YYYY-MM-DD)
function formatDateForInput(dateString) {
  if (!dateString) return '';
  
  try {
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // If it's a timestamp or other date format, convert it
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    
    // Format as YYYY-MM-DD for HTML date input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', dateString);
    return '';
  }
}

function getStatusColor(status) {
  switch(status) {
    case 'published': return '#43e97b';
    case 'draft': return '#4facfe';
    case 'archived': return '#fa709a';
    default: return '#999';
  }
}

function getStatusLabel(status) {
  switch(status) {
    case 'published': return 'Published';
    case 'draft': return 'Draft';
    case 'archived': return 'Archived';
    default: return 'Unknown';
  }
}

// Dashboard View
async function renderDashboard() {
  mainContainer.innerHTML = '';
  
  // Create main heading
  const heading = document.createElement('h2');
  heading.textContent = 'Quiz Admin';
  heading.className = 'admin-heading';
  mainContainer.appendChild(heading);

  // Create header section with controls
  const headerSection = document.createElement('div');
  headerSection.className = 'admin-header-section';
  
  // Create New Game button
  const createButton = document.createElement('button');
  createButton.type = 'button';
  createButton.textContent = 'Create New Game';
  createButton.className = 'create-game-btn';
  createButton.addEventListener('click', () => {
    currentGame = null;
    renderGameEditor(mainContainer);
  });
  headerSection.appendChild(createButton);
  
  // Search input
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search games...';
  searchInput.className = 'search-input';
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filteredGames = games.filter(game => 
      (game.title && game.title.toLowerCase().includes(searchTerm)) ||
      (game.description && game.description.toLowerCase().includes(searchTerm))
    );
    renderGameCards();
  });
  searchContainer.appendChild(searchInput);
  headerSection.appendChild(searchContainer);
  
  // Status filter
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container';
  const filterSelect = document.createElement('select');
  filterSelect.className = 'status-filter';
  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ];
  filterOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    filterSelect.appendChild(optionElement);
  });
  filterSelect.addEventListener('change', (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === 'all') {
      filteredGames = [...games];
    } else {
      filteredGames = games.filter(game => game.status === selectedStatus);
    }
    renderGameCards();
  });
  filterContainer.appendChild(filterSelect);
  headerSection.appendChild(filterContainer);
  
  mainContainer.appendChild(headerSection);

  // Create game cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'game-cards-container';
  mainContainer.appendChild(cardsContainer);

  // Fetch games from API
  try {
    console.log('🔄 Fetching games from API...');
    const apiGames = await API.getAllGames();
    
    // Normalize all games from API
    console.log('🔧 Normalizing games from API...');
    games = apiGames.map(normalizeGameData);
    filteredGames = [...games];
    
    // Enhanced logging
    logGameData('API Response', apiGames);
    logGameData('Normalized Games', games);
    
    console.log('✅ Games loaded and normalized successfully');
  } catch (error) {
    console.error('❌ Error fetching games:', error);
    console.log('🔄 Falling back to mock games...');
    games = [...mockGames];
    filteredGames = [...games];
    logGameData('Mock Games', games);
  }

  // Helper function to create a game card
  function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.gameId = game._id || game.id;
    
    // Card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'game-card-header';
    
    const title = document.createElement('h3');
    title.textContent = game.title || 'Untitled Game';
    title.className = 'game-card-title';
    cardHeader.appendChild(title);
    
    const status = document.createElement('span');
    status.textContent = getStatusLabel(game.status || 'draft');
    status.className = 'game-status';
    status.style.backgroundColor = getStatusColor(game.status || 'draft');
    cardHeader.appendChild(status);
    
    card.appendChild(cardHeader);
    
    // Card content
    const cardContent = document.createElement('div');
    cardContent.className = 'game-card-content';
    
    const description = document.createElement('p');
    description.textContent = game.description || 'No description available';
    description.className = 'game-description';
    cardContent.appendChild(description);
    
    const stats = document.createElement('div');
    stats.className = 'game-stats';
    
    const questionCount = document.createElement('span');
    questionCount.textContent = `${game.questions ? game.questions.length : 0} questions`;
    questionCount.className = 'question-count';
    stats.appendChild(questionCount);
    
    const lastModified = document.createElement('span');
    const modifiedDate = game.updatedAt || game.lastModified || game.createdAt;
    lastModified.textContent = `Modified: ${new Date(modifiedDate).toLocaleDateString()}`;
    lastModified.className = 'last-modified';
    stats.appendChild(lastModified);
    
    cardContent.appendChild(stats);
    card.appendChild(cardContent);
    
    // Card actions
    const cardActions = document.createElement('div');
    cardActions.className = 'game-card-actions';
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-game-btn';
    editBtn.addEventListener('click', () => {
      console.log('🖱️ Edit button clicked for game:', game);
      console.log('📋 Game details:', {
        id: game._id,
        title: game.title,
        questionsCount: game.questions?.length || 0,
        questions: game.questions
      });
      
      // Normalize the game before setting as current
      currentGame = normalizeGameData(game);
      console.log('✅ Current game set (normalized):', currentGame);
      
      renderGameEditor(mainContainer);
    });
    cardActions.appendChild(editBtn);
    
    // Publish/Unpublish button
    const publishBtn = document.createElement('button');
    publishBtn.type = 'button';
    publishBtn.textContent = (game.status || 'draft') === 'published' ? 'Unpublish' : 'Publish';
    publishBtn.className = (game.status || 'draft') === 'published' ? 'unpublish-game-btn' : 'publish-game-btn';
    publishBtn.addEventListener('click', async () => {
      try {
        await API.publishGame(game._id || game.id, (game.status || 'draft') !== 'published');
        renderDashboard();
      } catch (error) {
        console.error('Error publishing game:', error);
        alert('Error publishing game');
      }
    });
    cardActions.appendChild(publishBtn);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-game-btn';
    deleteBtn.addEventListener('click', async () => {
      if (confirm(`Are you sure you want to delete "${game.title}"?`)) {
        try {
          await API.deleteGame(game._id || game.id);
          renderDashboard();
        } catch (error) {
          console.error('Error deleting game:', error);
          alert('Error deleting game');
        }
      }
    });
    cardActions.appendChild(deleteBtn);
    
    // View Dashboard button
    const dashboardBtn = document.createElement('button');
    dashboardBtn.type = 'button';
    dashboardBtn.textContent = 'View Leaderboard';
    dashboardBtn.className = 'view-dashboard-btn';
    dashboardBtn.addEventListener('click', () => {
      console.log('View leaderboard for game:', game._id || game.id);
      currentGame = normalizeGameData(game);
      renderLeaderboard(game._id || game.id);
    });
    cardActions.appendChild(dashboardBtn);
    
    card.appendChild(cardActions);
    
    return card;
  }

  // Helper function to render game cards
  function renderGameCards() {
    cardsContainer.innerHTML = '';
    
    if (filteredGames.length === 0) {
      const noGames = document.createElement('div');
      noGames.className = 'no-games';
      noGames.textContent = 'No games found. Create your first game!';
      cardsContainer.appendChild(noGames);
      return;
    }
    
    filteredGames.forEach(game => {
      const card = createGameCard(game);
      cardsContainer.appendChild(card);
    });
  }

  // Initial render
  renderGameCards();
}

// Game Editor View
function renderGameEditor(mainContainer) {
  mainContainer.innerHTML = '';
  
  // Create header with back button
  const header = document.createElement('div');
  header.className = 'editor-header';
  
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.textContent = '← Back to Dashboard';
  backButton.className = 'back-btn';
  backButton.addEventListener('click', renderDashboard);
  header.appendChild(backButton);
  
  const title = document.createElement('h2');
  title.textContent = currentGame ? 'Edit Game' : 'Create New Game';
  title.className = 'editor-title';
  header.appendChild(title);
  
  mainContainer.appendChild(header);

  // Create form container
  const formContainer = document.createElement('div');
  formContainer.className = 'game-form-container';
  
  // Game details form
  const gameForm = document.createElement('form');
  gameForm.className = 'game-form';
  gameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveGame();
  });
  
  // Game ID (Auto Generated)
  const gameIdGroup = document.createElement('div');
  gameIdGroup.className = 'form-group';
  const gameIdLabel = document.createElement('label');
  gameIdLabel.textContent = 'Game ID';
  gameIdLabel.className = 'form-label';
  const gameIdInput = document.createElement('input');
  gameIdInput.type = 'text';
  gameIdInput.className = 'form-input';
  gameIdInput.value = currentGame ? currentGame._id : `game_${generateRandomId()}`;
  gameIdInput.readOnly = true;
  gameIdGroup.appendChild(gameIdLabel);
  gameIdGroup.appendChild(gameIdInput);
  gameForm.appendChild(gameIdGroup);
  
  // Game title
  const titleGroup = document.createElement('div');
  titleGroup.className = 'form-group';
  const titleLabel = document.createElement('label');
  titleLabel.textContent = 'Game Title *';
  titleLabel.className = 'form-label';
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.name = 'title';
  titleInput.className = 'form-input';
  titleInput.required = true;
  titleInput.value = currentGame ? currentGame.title : '';
  titleInput.placeholder = 'Enter game title';
  titleGroup.appendChild(titleLabel);
  titleGroup.appendChild(titleInput);
  gameForm.appendChild(titleGroup);
  
  // Description
  const descGroup = document.createElement('div');
  descGroup.className = 'form-group';
  const descLabel = document.createElement('label');
  descLabel.textContent = 'Description *';
  descLabel.className = 'form-label';
  const descTextarea = document.createElement('textarea');
  descTextarea.name = 'description';
  descTextarea.className = 'form-textarea';
  descTextarea.required = true;
  descTextarea.value = currentGame ? currentGame.description : '';
  descTextarea.placeholder = 'Enter game description';
  descTextarea.rows = 3;
  descGroup.appendChild(descLabel);
  descGroup.appendChild(descTextarea);
  gameForm.appendChild(descGroup);
  
  // Tags/Category
  const tagsGroup = document.createElement('div');
  tagsGroup.className = 'form-group';
  const tagsLabel = document.createElement('label');
  tagsLabel.textContent = 'Tags/Category';
  tagsLabel.className = 'form-label';
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.name = 'tags';
  tagsInput.className = 'form-input';
  tagsInput.value = currentGame && currentGame.tags ? currentGame.tags.join(', ') : '';
  tagsInput.placeholder = 'Enter tags separated by commas';
  tagsGroup.appendChild(tagsLabel);
  tagsGroup.appendChild(tagsInput);
  gameForm.appendChild(tagsGroup);
  
  // Publish status toggle
  const statusGroup = document.createElement('div');
  statusGroup.className = 'form-group';
  const statusLabel = document.createElement('label');
  statusLabel.textContent = 'Publish Status';
  statusLabel.className = 'form-label';
  const statusToggle = document.createElement('div');
  statusToggle.className = 'toggle-container';
  const statusCheckbox = document.createElement('input');
  statusCheckbox.type = 'checkbox';
  statusCheckbox.className = 'toggle-checkbox';
  statusCheckbox.checked = currentGame ? currentGame.status === 'published' : false;
  const statusSlider = document.createElement('span');
  statusSlider.className = 'toggle-slider';
  statusToggle.appendChild(statusCheckbox);
  statusToggle.appendChild(statusSlider);
  statusGroup.appendChild(statusLabel);
  statusGroup.appendChild(statusToggle);
  gameForm.appendChild(statusGroup);
  
  // Start Date
  const startDateGroup = document.createElement('div');
  startDateGroup.className = 'form-group';
  const startDateLabel = document.createElement('label');
  startDateLabel.textContent = 'Start Date *';
  startDateLabel.className = 'form-label';
  const startDateInput = document.createElement('input');
  startDateInput.type = 'date';
  startDateInput.name = 'startDate';
  startDateInput.className = 'form-input';
  startDateInput.required = true;
  // Debug: Log the currentGame object to see available fields
  if (currentGame) {
    console.log('Current game data for form population:', currentGame);
  }
  
  // Try multiple possible date field names from API response and format them
  const startDate = currentGame && (currentGame.startDate || currentGame.start_date || currentGame.start);
  startDateInput.value = formatDateForInput(startDate);
  startDateGroup.appendChild(startDateLabel);
  startDateGroup.appendChild(startDateInput);
  gameForm.appendChild(startDateGroup);
  
  // End Date
  const endDateGroup = document.createElement('div');
  endDateGroup.className = 'form-group';
  const endDateLabel = document.createElement('label');
  endDateLabel.textContent = 'End Date *';
  endDateLabel.className = 'form-label';
  const endDateInput = document.createElement('input');
  endDateInput.type = 'date';
  endDateInput.name = 'endDate';
  endDateInput.className = 'form-input';
  endDateInput.required = true;
  // Try multiple possible date field names from API response and format them
  const endDate = currentGame && (currentGame.endDate || currentGame.end_date || currentGame.end);
  endDateInput.value = formatDateForInput(endDate);
  endDateGroup.appendChild(endDateLabel);
  endDateGroup.appendChild(endDateInput);
  gameForm.appendChild(endDateGroup);
  
  // Save button
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.textContent = currentGame ? 'Update Game' : 'Create Game';
  saveButton.className = 'save-game-btn';
  gameForm.appendChild(saveButton);
  
  formContainer.appendChild(gameForm);
  mainContainer.appendChild(formContainer);

  // Question Management Section
  if (currentGame) {
    renderQuestionManagement();
  }
}

// Question Management Section
function renderQuestionManagement() {
  const questionSection = document.createElement('div');
  questionSection.className = 'question-management-section';
  
  const questionHeader = document.createElement('h3');
  questionHeader.textContent = 'Question Management';
  questionHeader.className = 'question-section-title';
  questionSection.appendChild(questionHeader);
  
  // Add Question button
  const addQuestionBtn = document.createElement('button');
  addQuestionBtn.type = 'button';
  addQuestionBtn.textContent = 'Add Question';
  addQuestionBtn.className = 'add-question-btn';
  addQuestionBtn.addEventListener('click', () => {
    addNewQuestion();
  });
  questionSection.appendChild(addQuestionBtn);
  
  // Add Questions button (plural)
  const submitQuestionsBtn = document.createElement('button');
  submitQuestionsBtn.type = 'button';
  submitQuestionsBtn.textContent = 'Submit Questions';
  submitQuestionsBtn.className = 'submit-questions-btn';
  submitQuestionsBtn.addEventListener('click', () => {
    submitQuestions();
  });
  questionSection.appendChild(submitQuestionsBtn);
  
  // Questions container
  const questionsContainer = document.createElement('div');
  questionsContainer.className = 'questions-container';
  questionSection.appendChild(questionsContainer);
  
  mainContainer.appendChild(questionSection);
  
  // Enhanced logging for question management
  console.log('🔍 renderQuestionManagement() called');
  console.log('📋 Current game state:', {
    hasCurrentGame: !!currentGame,
    gameId: currentGame?._id,
    gameTitle: currentGame?.title,
    questionsCount: currentGame?.questions?.length || 0
  });
  
  if (currentGame && currentGame.questions) {
    console.log('Loading existing questions:', currentGame.questions);
    currentGame.questions.forEach((q, index) => {
      console.log(`Question ${index + 1}:`, {
        id: q.questionId || q.id,
        type: q.questionType || q.type,
        text: q.questionText || q.text,
        optionsCount: q.options?.length || 0,
        correctAnswers: q.correctAnswer || q.correctAnswers
      });
    });
  } else {
    console.log('No existing questions found');
  }
  
  // Render existing questions
  renderQuestions();
  
  function addNewQuestion() {
    console.log('➕ addNewQuestion() called');
    const currentTime = new Date().toISOString();
    
    // Ensure questions array exists
    if (!currentGame.questions) {
      console.log('No questions array found, creating empty array');
      currentGame.questions = [];
    }
    
    const questionNumber = currentGame.questions.length + 1;
    console.log(`Creating question number: ${questionNumber}`);
    
    const newQuestion = {
      questionId: `q${questionNumber}`,
      questionType: 'single-choice',
      questionText: '',
      options: ['', ''],
      correctAnswer: [],
      timeLimit: 30,
      createdAt: currentTime
    };
    
    console.log('New question created:', newQuestion);
    currentGame.questions.push(newQuestion);
    console.log('Question added to currentGame.questions. Total questions:', currentGame.questions.length);
    
    renderQuestions();
  }
  
  function submitQuestions() {
    console.log('📤 submitQuestions() called');
    
    // Validate that there are questions to submit
    if (!currentGame.questions || currentGame.questions.length === 0) {
      alert('No questions to submit. Please add some questions first.');
      return;
    }
    
    // Validate that all questions have required fields
    const invalidQuestions = currentGame.questions.filter(q => 
      !q.questionText || q.questionText.trim() === '' ||
      !q.options || q.options.length < 2 ||
      q.options.some(opt => !opt || opt.trim() === '')
    );
    
    if (invalidQuestions.length > 0) {
      alert(`Please complete all questions. ${invalidQuestions.length} question(s) have missing or incomplete data.`);
      return;
    }
    
    // Create questions payload
    const questionsPayload = {
      gameId: currentGame._id,
      questions: currentGame.questions.map(question => ({
        questionId: question.questionId,
        questionType: question.questionType,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        timeLimit: question.timeLimit
      }))
    };
    
    console.log('📤 Questions payload created:', questionsPayload);
    console.log('✅ Questions validation passed, payload ready for new endpoint');
    
    // TODO: Call new endpoint with questionsPayload
    // await API.updateQuestions(currentGame._id, questionsPayload);
    
    // For now, show success message
    alert('Successfully prepared questions for submission!');
  }
  
  function renderQuestions() {
    console.log('🔄 renderQuestions() called');
    questionsContainer.innerHTML = '';
    
    // Ensure questions array exists
    if (!currentGame.questions) {
      console.log('⚠️ No questions array found, creating empty array');
      currentGame.questions = [];
    }
    
    console.log('📝 Before normalization - questions:', currentGame.questions);
    
    // Normalize question structure for compatibility using our helper function
    currentGame.questions = currentGame.questions.map(question => {
      console.log('🔧 Normalizing question in renderQuestions:', question);
      return normalizeQuestionData(question);
    });
    
    console.log('✅ After normalization - questions:', currentGame.questions);
    
    if (currentGame.questions.length === 0) {
      const noQuestions = document.createElement('div');
      noQuestions.className = 'no-questions';
      noQuestions.textContent = 'No questions added yet. Click "Add Question" to get started!';
      questionsContainer.appendChild(noQuestions);
      return;
    }
    
    currentGame.questions.forEach((question, index) => {
      const questionCard = createQuestionCard(question, index);
      questionsContainer.appendChild(questionCard);
    });
  }
  
  function createQuestionCard(question, index) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.questionId = question.questionId || question.id;
    
    // Question header
    const questionHeader = document.createElement('div');
    questionHeader.className = 'question-card-header';
    
    const questionNumber = document.createElement('span');
    questionNumber.textContent = `Question ${index + 1}`;
    questionNumber.className = 'question-number';
    questionHeader.appendChild(questionNumber);
    
    const questionType = document.createElement('select');
    questionType.className = 'question-type-select';
    questionType.value = question.questionType || question.type;
    const typeOptions = [
      { value: 'multiple-choice', label: 'Multiple Choice' },
      { value: 'single-choice', label: 'Single Choice' },
      { value: 'true-false', label: 'True/False' },
      { value: 'text', label: 'Text' }
    ];
    typeOptions.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      questionType.appendChild(optionElement);
    });
    questionType.addEventListener('change', (e) => {
      question.questionType = e.target.value;
      if (question.questionType === 'true-false') {
        question.options = ['true', 'false'];
        question.correctAnswer = [];
      }
      renderQuestions();
    });
    questionHeader.appendChild(questionType);
    
    const timeLimit = document.createElement('input');
    timeLimit.type = 'number';
    timeLimit.className = 'time-limit-input';
    timeLimit.value = question.timeLimit || 30;
    timeLimit.min = 5;
    timeLimit.max = 300;
    timeLimit.placeholder = 'Time (seconds)';
    timeLimit.addEventListener('change', (e) => {
      question.timeLimit = parseInt(e.target.value) || 30;
    });
    questionHeader.appendChild(timeLimit);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-question-btn';
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this question?')) {
        currentGame.questions.splice(index, 1);
        currentGame.questions.forEach((q, i) => {
          q.order = i + 1;
        });
        renderQuestions();
      }
    });
    questionHeader.appendChild(deleteBtn);
    
    card.appendChild(questionHeader);
    
    // Question text
    const questionTextGroup = document.createElement('div');
    questionTextGroup.className = 'form-group';
    const questionTextLabel = document.createElement('label');
    questionTextLabel.textContent = 'Question Text *';
    questionTextLabel.className = 'form-label';
    const questionTextInput = document.createElement('textarea');
    questionTextInput.className = 'form-textarea';
    questionTextInput.value = question.questionText || question.text || '';
    questionTextInput.placeholder = 'Enter your question';
    questionTextInput.rows = 2;
    questionTextInput.addEventListener('input', (e) => {
      question.questionText = e.target.value;
    });
    questionTextGroup.appendChild(questionTextLabel);
    questionTextGroup.appendChild(questionTextInput);
    card.appendChild(questionTextGroup);
    
    // Options (for multiple choice and single choice)
    if ((question.questionType || question.type) === 'multiple-choice' || (question.questionType || question.type) === 'single-choice') {
      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'options-container';
      
      const optionsLabel = document.createElement('label');
      optionsLabel.textContent = 'Answer Options *';
      optionsLabel.className = 'form-label';
      optionsContainer.appendChild(optionsLabel);
      
      question.options.forEach((option, optionIndex) => {
        const optionGroup = document.createElement('div');
        optionGroup.className = 'option-group';
        
        const optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.className = 'option-input';
        optionInput.value = option;
        optionInput.placeholder = `Option ${optionIndex + 1}`;
        optionInput.addEventListener('input', (e) => {
          question.options[optionIndex] = e.target.value;
        });
        
        const correctCheckbox = document.createElement('input');
        correctCheckbox.type = (question.questionType || question.type) === 'multiple-choice' ? 'checkbox' : 'radio';
        correctCheckbox.name = `correct_${question.questionId || question.id}`;
        correctCheckbox.className = 'correct-answer-checkbox';
        correctCheckbox.checked = (question.correctAnswer || question.correctAnswers || []).includes(optionIndex);
        correctCheckbox.addEventListener('change', (e) => {
          const correctAnswers = question.correctAnswer || question.correctAnswers || [];
          if (e.target.checked) {
            if ((question.questionType || question.type) === 'multiple-choice') {
              correctAnswers.push(optionIndex);
            } else {
              question.correctAnswer = [optionIndex];
            }
          } else {
            const index = correctAnswers.indexOf(optionIndex);
            if (index > -1) {
              correctAnswers.splice(index, 1);
            }
          }
        });
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-option-btn';
        removeBtn.addEventListener('click', () => {
          if (question.options.length > 2) {
            question.options.splice(optionIndex, 1);
            const correctAnswers = question.correctAnswer || question.correctAnswers || [];
            const updatedAnswers = correctAnswers
              .filter(answerIndex => answerIndex !== optionIndex)
              .map(answerIndex => answerIndex > optionIndex ? answerIndex - 1 : answerIndex);
            question.correctAnswer = updatedAnswers;
            renderQuestions();
          }
        });
        
        optionGroup.appendChild(correctCheckbox);
        optionGroup.appendChild(optionInput);
        if (question.options.length > 2) {
          optionGroup.appendChild(removeBtn);
        }
        optionsContainer.appendChild(optionGroup);
      });
      
      // Add option button
      const addOptionBtn = document.createElement('button');
      addOptionBtn.type = 'button';
      addOptionBtn.textContent = 'Add Option';
      addOptionBtn.className = 'add-option-btn';
      addOptionBtn.addEventListener('click', () => {
        question.options.push('');
        renderQuestions();
      });
      optionsContainer.appendChild(addOptionBtn);
      
      card.appendChild(optionsContainer);
    }
    
    // True/False options
    if ((question.questionType || question.type) === 'true-false') {
      const trueFalseContainer = document.createElement('div');
      trueFalseContainer.className = 'true-false-container';
      
      const trueFalseLabel = document.createElement('label');
      trueFalseLabel.textContent = 'Correct Answer *';
      trueFalseLabel.className = 'form-label';
      trueFalseContainer.appendChild(trueFalseLabel);
      
      const trueOption = document.createElement('div');
      trueOption.className = 'true-false-option';
      const trueCheckbox = document.createElement('input');
      trueCheckbox.type = 'checkbox';
      trueCheckbox.className = 'correct-answer-checkbox';
      trueCheckbox.checked = (question.correctAnswer || question.correctAnswers || []).includes(0);
      trueCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          (question.correctAnswer || question.correctAnswers || []).push(0);
        } else {
          const correctAnswers = question.correctAnswer || question.correctAnswers || [];
          const index = correctAnswers.indexOf(0);
          if (index > -1) correctAnswers.splice(index, 1);
        }
      });
      const trueLabel = document.createElement('label');
      trueLabel.textContent = 'True';
      trueOption.appendChild(trueCheckbox);
      trueOption.appendChild(trueLabel);
      trueFalseContainer.appendChild(trueOption);
      
      const falseOption = document.createElement('div');
      falseOption.className = 'true-false-option';
      const falseCheckbox = document.createElement('input');
      falseCheckbox.type = 'checkbox';
      falseCheckbox.className = 'correct-answer-checkbox';
      falseCheckbox.checked = (question.correctAnswer || question.correctAnswers || []).includes(1);
      falseCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          (question.correctAnswer || question.correctAnswers || []).push(1);
        } else {
          const correctAnswers = question.correctAnswer || question.correctAnswers || [];
          const index = correctAnswers.indexOf(1);
          if (index > -1) correctAnswers.splice(index, 1);
        }
      });
      const falseLabel = document.createElement('label');
      falseLabel.textContent = 'False';
      falseOption.appendChild(falseCheckbox);
      falseOption.appendChild(falseLabel);
      trueFalseContainer.appendChild(falseOption);
      
      card.appendChild(trueFalseContainer);
    }
    
    return card;
  }
}

// Save game function
async function saveGame() {
  const completeGameData = buildCompleteGamePayload();
  
  try {
    if (currentGame) {
      await API.updateGame(currentGame._id, completeGameData);
    } else {
      await API.addGame(completeGameData);
    }
    renderDashboard();
  } catch (error) {
    console.error('Error saving game:', error);
    alert('Error saving game');
  }
}

// Always build the complete game object from current state
function buildCompleteGamePayload() {
  console.log('🔧 buildCompleteGamePayload() called');
  const formData = new FormData(mainContainer.querySelector('.game-form'));
  const currentTime = new Date().toISOString();
  
  // For new games, generate a temporary ID; for existing games, use the current ID
  const gameId = currentGame ? currentGame._id : generateRandomId();
  
  console.log('📋 Form data collected:', {
    title: formData.get('title'),
    description: formData.get('description'),
    tags: formData.get('tags'),
    status: mainContainer.querySelector('.toggle-checkbox').checked ? 'published' : 'draft',
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate')
  });
  
  console.log('📝 Current game state:', {
    hasCurrentGame: !!currentGame,
    gameId: gameId,
    questionsCount: currentGame?.questions?.length || 0,
    questions: currentGame?.questions || []
  });
  
  const payload = {
    _id: gameId,
    title: formData.get('title'),
    description: formData.get('description'),
    tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
    status: mainContainer.querySelector('.toggle-checkbox').checked ? 'published' : 'draft',
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    questions: currentGame ? (currentGame.questions || []) : [],  // Current questions state (empty for new games)
    updatedAt: currentTime
  };
  
  console.log('📤 Complete payload for API:', payload);
  return payload;
}


// Mock leaderboard data generator for development/testing
function generateMockLeaderboardData() {
  const mockPlayers = [
    { name: 'Preetish', avatar: '👨‍💼', score: 1020, rank: 1 },
    { name: 'Pankaj', avatar: '👨‍💻', score: 880, rank: 2 },
    { name: 'Alice Johnson', avatar: '👩‍🎓', score: 820, rank: 3 },
    { name: 'Bob Smith', avatar: '👨‍🏫', score: 750, rank: 4 },
    { name: 'Carol Davis', avatar: '👩‍🔬', score: 680, rank: 5 },
    { name: 'David Wilson', avatar: '👨‍🎨', score: 620, rank: 6 },
    { name: 'Emma Brown', avatar: '👩‍⚕️', score: 580, rank: 7 },
    { name: 'Frank Miller', avatar: '👨‍🚀', score: 540, rank: 8 },
    { name: 'Grace Lee', avatar: '👩‍🎤', score: 500, rank: 9 },
    { name: 'Henry Taylor', avatar: '👨‍🍳', score: 460, rank: 10 }
  ];
  
  return mockPlayers;
}

// Leaderboard View
async function renderLeaderboard(gameId) {
  console.log('🎯 Rendering leaderboard for game:', gameId);
  currentView = 'leaderboard';
  
  mainContainer.innerHTML = '';
  
  // Create header with back button
  const header = document.createElement('div');
  header.className = 'editor-header';
  
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.textContent = '← Back to Dashboard';
  backButton.className = 'back-btn';
  backButton.addEventListener('click', renderDashboard);
  header.appendChild(backButton);
  
  const title = document.createElement('h2');
  title.textContent = 'Game Leaderboard';
  title.className = 'editor-title';
  header.appendChild(title);
  
  mainContainer.appendChild(header);

  // Create leaderboard container
  const leaderboardContainer = document.createElement('div');
  leaderboardContainer.className = 'leaderboard-container';
  
  // Loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'leaderboard-loading';
  loadingDiv.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Loading leaderboard data...</p>
  `;
  leaderboardContainer.appendChild(loadingDiv);
  mainContainer.appendChild(leaderboardContainer);

  try {
    // Fetch leaderboard data
    console.log('🔄 Fetching leaderboard data...');
    leaderboardData = await API.getGameLeaderboard(gameId);
    console.log('✅ Leaderboard data loaded:', leaderboardData);
    
    // Clear loading and render leaderboard
    leaderboardContainer.innerHTML = '';
    renderLeaderboardContent(leaderboardContainer);
    
  } catch (error) {
    console.error('❌ Error loading leaderboard:', error);
    leaderboardContainer.innerHTML = `
      <div class="leaderboard-error">
        <p>Error loading leaderboard data. Please try again.</p>
        <button class="retry-btn" onclick="renderLeaderboard('${gameId}')">Retry</button>
      </div>
    `;
  }
}

// Render leaderboard content
function renderLeaderboardContent(container) {
  // Game info section
  const gameInfo = document.createElement('div');
  gameInfo.className = 'game-info-section';
  
  const gameTitle = document.createElement('h3');
  gameTitle.textContent = currentGame ? currentGame.title : 'Game Leaderboard';
  gameTitle.className = 'game-title';
  gameInfo.appendChild(gameTitle);
  
  const gameStats = document.createElement('div');
  gameStats.className = 'game-stats-summary';
  gameStats.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Total Players:</span>
      <span class="stat-value">${leaderboardData.length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Highest Score:</span>
      <span class="stat-value">${leaderboardData.length > 0 ? Math.max(...leaderboardData.map(p => p.score)) : 0}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Average Score:</span>
      <span class="stat-value">${leaderboardData.length > 0 ? Math.round(leaderboardData.reduce((sum, p) => sum + p.score, 0) / leaderboardData.length) : 0}</span>
    </div>
  `;
  gameInfo.appendChild(gameStats);
  container.appendChild(gameInfo);

  // Leaderboard table
  const leaderboardTable = document.createElement('div');
  leaderboardTable.className = 'leaderboard-table';
  
  // Table header
  const tableHeader = document.createElement('div');
  tableHeader.className = 'leaderboard-header';
  tableHeader.innerHTML = `
    <div class="header-rank">Rank</div>
    <div class="header-player">Player</div>
    <div class="header-score">Score</div>
    <div class="header-avatar">Avatar</div>
  `;
  leaderboardTable.appendChild(tableHeader);
  
  // Table body
  const tableBody = document.createElement('div');
  tableBody.className = 'leaderboard-body';
  
  if (leaderboardData.length === 0) {
    const noData = document.createElement('div');
    noData.className = 'no-leaderboard-data';
    noData.innerHTML = `
      <div class="no-data-icon">🏆</div>
      <h4>No Leaderboard Data</h4>
      <p>No players have completed this game yet.</p>
    `;
    tableBody.appendChild(noData);
  } else {
    // Sort players by score (highest first)
    const sortedPlayers = [...leaderboardData].sort((a, b) => b.score - a.score);
    
    sortedPlayers.forEach((player, index) => {
      const playerRow = createPlayerRow(player, index + 1);
      tableBody.appendChild(playerRow);
    });
  }
  
  leaderboardTable.appendChild(tableBody);
  container.appendChild(leaderboardTable);
  
  // Refresh button
  const refreshButton = document.createElement('button');
  refreshButton.type = 'button';
  refreshButton.textContent = '🔄 Refresh Leaderboard';
  refreshButton.className = 'refresh-leaderboard-btn';
  refreshButton.addEventListener('click', async () => {
    try {
      leaderboardData = await API.getGameLeaderboard(currentGame._id);
      renderLeaderboardContent(container);
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    }
  });
  container.appendChild(refreshButton);
}

// Create player row for leaderboard
function createPlayerRow(player, rank) {
  const row = document.createElement('div');
  row.className = 'leaderboard-row';
  
  // Add special styling for top 3 players
  if (rank <= 3) {
    row.classList.add(`rank-${rank}`);
  }
  
  row.innerHTML = `
    <div class="player-rank">
      <span class="rank-number">${rank}</span>
      ${rank <= 3 ? `<span class="rank-medal">${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>` : ''}
    </div>
    <div class="player-info">
      <div class="player-name">${player.name}</div>
    </div>
    <div class="player-score">
      <span class="score-value">${player.score}</span>
      <span class="score-label">points</span>
    </div>
    <div class="player-avatar">
      <span class="avatar-emoji">${player.avatar}</span>
    </div>
  `;
  
  return row;
}


export default function decorate(block) {
  console.log("Kahoot-style Admin Interface loaded");
  
  // Initialize main container
  mainContainer = block;
  
  // Clear the block and create the main container
  block.innerHTML = '';
  
  // Create main container wrapper
  const containerWrapper = document.createElement('div');
  containerWrapper.className = 'kahoot-admin-container';
  block.appendChild(containerWrapper);
  
  // Set mainContainer to the wrapper
  mainContainer = containerWrapper;
  
  // Initialize with dashboard view
  renderDashboard();
}
