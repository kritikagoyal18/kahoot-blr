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
  gameIdInput.value = currentGame ? currentGame.id : `game_${generateRandomId()}`;
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
      await API.createGame(gameData);
    }
    renderDashboard();
  } catch (error) {
    console.error('Error saving game:', error);
    alert('Error saving game');
  }
}   

/**
* loads and decorates the header, mainly the nav
* @param {Element} block The header block element
*/
export default async function decorate(block) {
  //const quizmanagementContainer = block.querySelectorAll('.quiz-management')[0];
  block.innerHTML = '';
  //renderGameEditor(block);
  
  block.innerHTML = `
  <div class="test-container">
        <div class="test-header">
            <h1>Kahoot-style Admin Interface Demo</h1>
            <p>A comprehensive admin interface for creating, editing, and managing interactive quiz games</p>
        </div>
        
        <div class="test-description">
            <h3>Features Implemented:</h3>
            <ul>
                <li><strong>Dashboard View:</strong> List all games with search, filter, and action buttons</li>
                <li><strong>Game Editor:</strong> Create and edit games with all required fields</li>
                <li><strong>Question Management:</strong> Add, edit, delete questions with multiple question types</li>
                <li><strong>API Integration:</strong> Ready hooks for backend integration</li>
                <li><strong>Responsive Design:</strong> Works on all device sizes</li>
                <li><strong>AEM EDS Compliance:</strong> Follows Adobe Experience Manager patterns</li>
            </ul>
            
            <h3>API Endpoints Ready:</h3>
            <ul>
                <li>GET /games - List all games</li>
                <li>POST /game - Create new game</li>
                <li>PUT /game/:id - Update game</li>
                <li>DELETE /game/:id - Delete game</li>
                <li>PATCH /game/:id/publish - Publish/unpublish game</li>
                <li>POST /game/:id/question - Add question</li>
                <li>PUT /game/:id/question/:questionId - Update question</li>
                <li>DELETE /game/:id/question/:questionId - Delete question</li>
            </ul>
        </div>
        
        <div class="quiz-management"></div>
  </div>`;
}
