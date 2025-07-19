export default function decorate(block) {
  console.log("Add Question added");
  // State management
  let questions = [];
  let questionCounter = 0;

  // Clear the block and create the main container
  block.innerHTML = '';
  
  // Create main heading
  const heading = document.createElement('h2');
  heading.textContent = 'Add Questions';
  heading.className = 'add-question-heading';
  block.appendChild(heading);

  // Create container for question panels
  const panelsContainer = document.createElement('div');
  panelsContainer.className = 'question-panels-container';
  block.appendChild(panelsContainer);

  // Create "Add Question" button
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.textContent = 'Add Question';
  addButton.className = 'add-question-btn';
  block.appendChild(addButton);

  // Create submit button container
  const submitContainer = document.createElement('div');
  submitContainer.className = 'submit-container';
  const submitButton = document.createElement('button');
  submitButton.type = 'button';
  submitButton.textContent = 'Submit Questions';
  submitButton.className = 'submit-questions-btn';
  submitContainer.appendChild(submitButton);
  block.appendChild(submitContainer);

  // Helper function to create option fields
  function createOptionField(questionIndex, optionIndex, value = '') {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option-field';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Option ${optionIndex + 1}`;
    input.value = value;
    input.className = 'option-input';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-option-btn';
    removeBtn.addEventListener('click', () => {
      if (questions[questionIndex].options.length > 2) {
        questions[questionIndex].options.splice(optionIndex, 1);
        renderQuestionPanel(questionIndex);
      }
    });
    
    optionDiv.appendChild(input);
    if (questions[questionIndex].options.length > 2) {
      optionDiv.appendChild(removeBtn);
    }
    
    return optionDiv;
  }

  // Helper function to create the third field based on question type
  function createTypeSpecificField(questionIndex) {
    const container = document.createElement('div');
    container.className = 'type-specific-field';
    
    const question = questions[questionIndex];
    
    if (question.type === 'true-false') {
      // True/False options
      const trueLabel = document.createElement('label');
      const trueRadio = document.createElement('input');
      trueRadio.type = 'radio';
      trueRadio.name = `correct-${questionIndex}`;
      trueRadio.value = 'true';
      trueRadio.checked = question.correctAnswer === 'true';
      trueLabel.appendChild(trueRadio);
      trueLabel.appendChild(document.createTextNode(' True'));
      
      const falseLabel = document.createElement('label');
      const falseRadio = document.createElement('input');
      falseRadio.type = 'radio';
      falseRadio.name = `correct-${questionIndex}`;
      falseRadio.value = 'false';
      falseRadio.checked = question.correctAnswer === 'false';
      falseLabel.appendChild(falseRadio);
      falseLabel.appendChild(document.createTextNode(' False'));
      
      container.appendChild(trueLabel);
      container.appendChild(falseLabel);
      
      // Event listeners
      [trueRadio, falseRadio].forEach(radio => {
        radio.addEventListener('change', (e) => {
          questions[questionIndex].correctAnswer = e.target.value;
        });
      });
      
    } else if (question.type === 'single-choice' || question.type === 'multiple-choice') {
      // Options container
      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'options-container';
      
      // Render existing options
      question.options.forEach((option, optionIndex) => {
        const optionDiv = createOptionField(questionIndex, optionIndex, option);
        optionsContainer.appendChild(optionDiv);
      });
      
      // Add option button
      const addOptionBtn = document.createElement('button');
      addOptionBtn.type = 'button';
      addOptionBtn.textContent = 'Add Option';
      addOptionBtn.className = 'add-option-btn';
      addOptionBtn.addEventListener('click', () => {
        questions[questionIndex].options.push('');
        renderQuestionPanel(questionIndex);
      });
      
      container.appendChild(optionsContainer);
      container.appendChild(addOptionBtn);
    }
    
    return container;
  }

  // Helper function to render a single question panel
  function renderQuestionPanel(questionIndex) {
    const question = questions[questionIndex];
    const panel = document.createElement('div');
    panel.className = 'question-panel';
    panel.dataset.questionIndex = questionIndex;
    
    // Question number
    const questionNumber = document.createElement('h3');
    questionNumber.textContent = `Question ${questionIndex + 1}`;
    questionNumber.className = 'question-number';
    panel.appendChild(questionNumber);
    
    // Question text input
    const questionInput = document.createElement('textarea');
    questionInput.placeholder = 'Enter your question here...';
    questionInput.value = question.text;
    questionInput.className = 'question-input';
    questionInput.addEventListener('input', (e) => {
      questions[questionIndex].text = e.target.value;
    });
    panel.appendChild(questionInput);
    
    // Question type dropdown
    const typeSelect = document.createElement('select');
    typeSelect.className = 'question-type-select';
    const typeOptions = [
      { value: 'single-choice', label: 'Single Choice' },
      { value: 'multiple-choice', label: 'Multiple Choice' },
      { value: 'true-false', label: 'True/False' }
    ];
    
    typeOptions.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      if (question.type === option.value) optionElement.selected = true;
      typeSelect.appendChild(optionElement);
    });
    
    typeSelect.addEventListener('change', (e) => {
      questions[questionIndex].type = e.target.value;
      // Reset options and correct answer based on new type
      if (e.target.value === 'true-false') {
        questions[questionIndex].options = ['true', 'false'];
        questions[questionIndex].correctAnswer = '';
      } else {
        questions[questionIndex].options = ['', ''];
        questions[questionIndex].correctAnswer = '';
      }
      renderQuestionPanel(questionIndex);
    });
    panel.appendChild(typeSelect);
    
    // Type-specific field (options or true/false)
    const typeSpecificField = createTypeSpecificField(questionIndex);
    panel.appendChild(typeSpecificField);
    
    // Time limit field
    const timeContainer = document.createElement('div');
    timeContainer.className = 'time-container';
    const timeLabel = document.createElement('label');
    timeLabel.textContent = 'Time Limit (seconds):';
    const timeInput = document.createElement('input');
    timeInput.type = 'number';
    timeInput.min = '1';
    timeInput.max = '300';
    timeInput.value = question.timeLimit || 30;
    timeInput.className = 'time-input';
    timeInput.addEventListener('input', (e) => {
      questions[questionIndex].timeLimit = parseInt(e.target.value) || 30;
    });
    timeContainer.appendChild(timeLabel);
    timeContainer.appendChild(timeInput);
    panel.appendChild(timeContainer);
    
    // Remove question button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove Question';
    removeBtn.className = 'remove-question-btn';
    removeBtn.addEventListener('click', () => {
      questions.splice(questionIndex, 1);
      renderAllPanels();
    });
    panel.appendChild(removeBtn);
    
    return panel;
  }

  // Helper function to render all question panels
  function renderAllPanels() {
    panelsContainer.innerHTML = '';
    questions.forEach((_, index) => {
      const panel = renderQuestionPanel(index);
      panelsContainer.appendChild(panel);
    });
    
    // Update submit button visibility
    submitContainer.style.display = questions.length > 0 ? 'block' : 'none';
  }

  // Add question button handler
  addButton.addEventListener('click', () => {
    questions.push({
      text: '',
      type: 'single-choice',
      options: ['', ''],
      correctAnswer: '',
      timeLimit: 30
    });
    renderAllPanels();
  });

  // Submit button handler
  submitButton.addEventListener('click', () => {
    // Validate all questions
    const errors = [];
    
    questions.forEach((question, index) => {
      if (!question.text.trim()) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }
      
      if (question.type === 'true-false') {
        if (!question.correctAnswer) {
          errors.push(`Question ${index + 1}: Please select correct answer (True/False)`);
        }
      } else {
        if (question.options.length < 2) {
          errors.push(`Question ${index + 1}: At least 2 options are required`);
        }
        
        const validOptions = question.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          errors.push(`Question ${index + 1}: At least 2 non-empty options are required`);
        }
        
        if (!question.correctAnswer) {
          errors.push(`Question ${index + 1}: Please select correct answer`);
        }
      }
      
      if (!question.timeLimit || question.timeLimit < 1) {
        errors.push(`Question ${index + 1}: Time limit must be at least 1 second`);
      }
    });
    
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }
    
    // All validations passed - submit the questions
    console.log('Questions submitted:', questions);
    alert(`Successfully submitted ${questions.length} questions!`);
    
    // Here you can add logic to send the questions to your backend
    // For example: submitQuestions(questions);
  });

  // Initial render (no panels)
  renderAllPanels();
}