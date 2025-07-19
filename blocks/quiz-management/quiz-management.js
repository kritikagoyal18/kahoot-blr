export default function decorate(block) {
  console.log("Quiz Management Dashboard loaded");
  
  // Mock data for quizzes
  const mockQuizzes = [
    {
      id: "quiz_001",
      title: "Mathematics Basics",
      description: "Fundamental mathematics concepts including algebra, geometry, and arithmetic",
      questionCount: 15,
      status: "published",
      createdAt: "2024-01-15",
      lastModified: "2024-01-20"
    },
    {
      id: "quiz_002", 
      title: "Science Quiz",
      description: "General science questions covering physics, chemistry, and biology",
      questionCount: 12,
      status: "draft",
      createdAt: "2024-01-18",
      lastModified: "2024-01-19"
    },
    {
      id: "quiz_003",
      title: "History Trivia",
      description: "World history questions from ancient civilizations to modern times",
      questionCount: 20,
      status: "archived",
      createdAt: "2024-01-10",
      lastModified: "2024-01-12"
    },
    {
      id: "quiz_004",
      title: "Geography Challenge",
      description: "Test your knowledge of countries, capitals, and world geography",
      questionCount: 18,
      status: "published",
      createdAt: "2024-01-22",
      lastModified: "2024-01-22"
    },
    {
      id: "quiz_005",
      title: "Literature Quiz",
      description: "Classic literature, authors, and famous literary works",
      questionCount: 10,
      status: "draft",
      createdAt: "2024-01-25",
      lastModified: "2024-01-25"
    },
    {
      id: "quiz_006",
      title: "Technology Quiz",
      description: "Modern technology, programming, and computer science basics",
      questionCount: 14,
      status: "published",
      createdAt: "2024-01-28",
      lastModified: "2024-01-29"
    }
  ];

  // Clear the block and create the main container
  block.innerHTML = '';
  
  // Create main heading
  const heading = document.createElement('h2');
  heading.textContent = 'Quiz Management';
  heading.className = 'quiz-management-heading';
  block.appendChild(heading);

  // Create header section with controls
  const headerSection = document.createElement('div');
  headerSection.className = 'quiz-header-section';
  
  // Create New Quiz button
  const createButton = document.createElement('button');
  createButton.type = 'button';
  createButton.textContent = 'Create New Quiz';
  createButton.className = 'create-quiz-btn';
  headerSection.appendChild(createButton);
  
  // Search input
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search quizzes...';
  searchInput.className = 'search-input';
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
  filterContainer.appendChild(filterSelect);
  headerSection.appendChild(filterContainer);
  
  block.appendChild(headerSection);

  // Create quiz cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'quiz-cards-container';
  block.appendChild(cardsContainer);

  // Helper function to get status color
  function getStatusColor(status) {
    switch(status) {
      case 'published': return '#43e97b';
      case 'draft': return '#4facfe';
      case 'archived': return '#fa709a';
      default: return '#999';
    }
  }

  // Helper function to get status label
  function getStatusLabel(status) {
    switch(status) {
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return 'Unknown';
    }
  }

  // Helper function to create a quiz card
  function createQuizCard(quiz) {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.dataset.quizId = quiz.id;
    
    // Card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'quiz-card-header';
    
    const title = document.createElement('h3');
    title.textContent = quiz.title;
    title.className = 'quiz-card-title';
    cardHeader.appendChild(title);
    
    const status = document.createElement('span');
    status.textContent = getStatusLabel(quiz.status);
    status.className = 'quiz-status';
    status.style.backgroundColor = getStatusColor(quiz.status);
    cardHeader.appendChild(status);
    
    card.appendChild(cardHeader);
    
    // Card content
    const cardContent = document.createElement('div');
    cardContent.className = 'quiz-card-content';
    
    const description = document.createElement('p');
    description.textContent = quiz.description;
    description.className = 'quiz-description';
    cardContent.appendChild(description);
    
    const stats = document.createElement('div');
    stats.className = 'quiz-stats';
    
    const questionCount = document.createElement('span');
    questionCount.textContent = `${quiz.questionCount} questions`;
    questionCount.className = 'question-count';
    stats.appendChild(questionCount);
    
    const lastModified = document.createElement('span');
    lastModified.textContent = `Modified: ${new Date(quiz.lastModified).toLocaleDateString()}`;
    lastModified.className = 'last-modified';
    stats.appendChild(lastModified);
    
    cardContent.appendChild(stats);
    card.appendChild(cardContent);
    
    // Card actions
    const cardActions = document.createElement('div');
    cardActions.className = 'quiz-card-actions';
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-quiz-btn';
    editBtn.addEventListener('click', () => {
      console.log('Edit quiz:', quiz.id);
      // TODO: Navigate to quiz editor
    });
    cardActions.appendChild(editBtn);
    
    // Play button (for published quizzes)
    if (quiz.status === 'published') {
      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.textContent = 'Play';
      playBtn.className = 'play-quiz-btn';
      playBtn.addEventListener('click', () => {
        console.log('Play quiz:', quiz.id);
        // TODO: Start quiz game
      });
      cardActions.appendChild(playBtn);
    }
    
    // Archive/Restore button
    const archiveBtn = document.createElement('button');
    archiveBtn.type = 'button';
    archiveBtn.textContent = quiz.status === 'archived' ? 'Restore' : 'Archive';
    archiveBtn.className = quiz.status === 'archived' ? 'restore-quiz-btn' : 'archive-quiz-btn';
    archiveBtn.addEventListener('click', () => {
      console.log(quiz.status === 'archived' ? 'Restore quiz:' : 'Archive quiz:', quiz.id);
      // TODO: Toggle archive status
    });
    cardActions.appendChild(archiveBtn);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-quiz-btn';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
        console.log('Delete quiz:', quiz.id);
        // TODO: Delete quiz
      }
    });
    cardActions.appendChild(deleteBtn);
    
    card.appendChild(cardActions);
    
    return card;
  }

  // Helper function to render quiz cards
  function renderQuizCards(quizzes = mockQuizzes) {
    cardsContainer.innerHTML = '';
    
    if (quizzes.length === 0) {
      const noQuizzes = document.createElement('div');
      noQuizzes.className = 'no-quizzes';
      noQuizzes.textContent = 'No quizzes found. Create your first quiz!';
      cardsContainer.appendChild(noQuizzes);
      return;
    }
    
    quizzes.forEach(quiz => {
      const card = createQuizCard(quiz);
      cardsContainer.appendChild(card);
    });
  }

  // Event listeners
  createButton.addEventListener('click', () => {
    console.log('Create new quiz clicked');
    // Redirect to the quiz creation page
    window.location.href = 'https://author-p102636-e1547569.adobeaemcloud.com/content/kahoot-blr/language-masters/en.html';
  });

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredQuizzes = mockQuizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(searchTerm) ||
      quiz.description.toLowerCase().includes(searchTerm)
    );
    renderQuizCards(filteredQuizzes);
  });

  filterSelect.addEventListener('change', (e) => {
    const selectedStatus = e.target.value;
    let filteredQuizzes = mockQuizzes;
    
    if (selectedStatus !== 'all') {
      filteredQuizzes = mockQuizzes.filter(quiz => quiz.status === selectedStatus);
    }
    
    renderQuizCards(filteredQuizzes);
  });

  // Initial render
  renderQuizCards();
}
