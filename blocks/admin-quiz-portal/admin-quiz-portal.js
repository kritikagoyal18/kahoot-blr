// State management
let currentView = 'dashboard';
let currentGame = null;
let games = [];
let filteredGames = [];
let mainContainer = null;

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
        correctAnswers: [1],
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
        throw new Error(`HTTP error! status: ${response.status}`);
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
  
  async updateGame(id, gameData) {
    console.log('PUT /game/:id', { id, gameData });
    const index = games.findIndex(game => game.id === id);
    if (index !== -1) {
      games[index] = { ...games[index], ...gameData, lastModified: new Date().toISOString() };
      return games[index];
    }
    throw new Error('Game not found');
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
  }
};

// Helper functions
function generateRandomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
    games = await API.getAllGames();
    filteredGames = [...games];
    console.log('Fetched games:', games);
  } catch (error) {
    console.error('Error fetching games:', error);
    games = [...mockGames];
    filteredGames = [...games];
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
      currentGame = game;
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
    dashboardBtn.textContent = 'View Dashboard';
    dashboardBtn.className = 'view-dashboard-btn';
    dashboardBtn.addEventListener('click', () => {
      console.log('View dashboard for game:', game._id || game.id);
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
  gameIdInput.value = currentGame ? currentGame._id : '';
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
  tagsInput.value = currentGame ? currentGame.tags.join(', ') : '';
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
  startDateInput.value = currentGame ? currentGame.startDate : '';
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
  endDateInput.value = currentGame ? currentGame.endDate : '';
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
  
  // Questions container
  const questionsContainer = document.createElement('div');
  questionsContainer.className = 'questions-container';
  questionSection.appendChild(questionsContainer);
  
  mainContainer.appendChild(questionSection);
  
  // Render existing questions
  renderQuestions();
  
  function addNewQuestion() {
    const newQuestion = {
      id: `q${Date.now()}`,
      type: 'multiple-choice',
      text: '',
      options: ['', ''],
      correctAnswers: [],
      timeLimit: 30,
      order: currentGame.questions.length + 1
    };
    
    currentGame.questions.push(newQuestion);
    renderQuestions();
  }
  
  function renderQuestions() {
    questionsContainer.innerHTML = '';
    
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
    card.dataset.questionId = question.id;
    
    // Question header
    const questionHeader = document.createElement('div');
    questionHeader.className = 'question-card-header';
    
    const questionNumber = document.createElement('span');
    questionNumber.textContent = `Question ${index + 1}`;
    questionNumber.className = 'question-number';
    questionHeader.appendChild(questionNumber);
    
    const questionType = document.createElement('select');
    questionType.className = 'question-type-select';
    questionType.value = question.type;
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
      question.type = e.target.value;
      if (question.type === 'true-false') {
        question.options = ['True', 'False'];
        question.correctAnswers = [];
      }
      renderQuestions();
    });
    questionHeader.appendChild(questionType);
    
    const timeLimit = document.createElement('input');
    timeLimit.type = 'number';
    timeLimit.className = 'time-limit-input';
    timeLimit.value = question.timeLimit;
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
    questionTextInput.value = question.text;
    questionTextInput.placeholder = 'Enter your question';
    questionTextInput.rows = 2;
    questionTextInput.addEventListener('input', (e) => {
      question.text = e.target.value;
    });
    questionTextGroup.appendChild(questionTextLabel);
    questionTextGroup.appendChild(questionTextInput);
    card.appendChild(questionTextGroup);
    
    // Options (for multiple choice and single choice)
    if (question.type === 'multiple-choice' || question.type === 'single-choice') {
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
        correctCheckbox.type = question.type === 'multiple-choice' ? 'checkbox' : 'radio';
        correctCheckbox.name = `correct_${question.id}`;
        correctCheckbox.className = 'correct-answer-checkbox';
        correctCheckbox.checked = question.correctAnswers.includes(optionIndex);
        correctCheckbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            if (question.type === 'multiple-choice') {
              question.correctAnswers.push(optionIndex);
            } else {
              question.correctAnswers = [optionIndex];
            }
          } else {
            const index = question.correctAnswers.indexOf(optionIndex);
            if (index > -1) {
              question.correctAnswers.splice(index, 1);
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
            question.correctAnswers = question.correctAnswers
              .filter(answerIndex => answerIndex !== optionIndex)
              .map(answerIndex => answerIndex > optionIndex ? answerIndex - 1 : answerIndex);
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
    if (question.type === 'true-false') {
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
      trueCheckbox.checked = question.correctAnswers.includes(0);
      trueCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          question.correctAnswers.push(0);
        } else {
          const index = question.correctAnswers.indexOf(0);
          if (index > -1) question.correctAnswers.splice(index, 1);
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
      falseCheckbox.checked = question.correctAnswers.includes(1);
      falseCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          question.correctAnswers.push(1);
        } else {
          const index = question.correctAnswers.indexOf(1);
          if (index > -1) question.correctAnswers.splice(index, 1);
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
  const formData = new FormData(mainContainer.querySelector('.game-form'));
  const gameData = {
    title: formData.get('title'),
    description: formData.get('description'),
    tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
    status: mainContainer.querySelector('.toggle-checkbox').checked ? 'published' : 'draft',
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    questions: currentGame ? currentGame.questions : []
  };
  
  try {
    if (currentGame) {
      await API.updateGame(currentGame.id, gameData);
    } else {
      await API.addGame(gameData);
    }
    renderDashboard();
  } catch (error) {
    console.error('Error saving game:', error);
    alert('Error saving game');
  }
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
