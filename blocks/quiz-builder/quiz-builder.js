import { getMetadata } from '../../scripts/aem.js';
import { isAuthorEnvironment, moveInstrumentation } from '../../scripts/scripts.js';

/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
	// Configuration
  const CONFIG = {
    WRAPPER_SERVICE_URL: 'https://prod-31.westus.logic.azure.com:443/workflows/2660b7afa9524acbae379074ae38501e/triggers/manual/paths/invoke',
    WRAPPER_SERVICE_PARAMS: 'api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kfcQD5S7ovej9RHdGZFVfgvA-eEqNlb6r_ukuByZ64o',
    GRAPHQL_QUERY: '/graphql/execute.json/wknd-universal/CTAByPath',
    EXCLUDED_THEME_KEYS: new Set(['brandSite', 'brandLogo'])
  };
	
	const hostname = getMetadata('hostname');	
  const aemauthorurl = getMetadata('authorurl') || '';
	
  const aempublishurl = hostname?.replace('author', 'publish')?.replace(/\/$/, '');  
	
	//const aempublishurl = getMetadata('publishurl') || '';
	
  const persistedquery = '/graphql/execute.json/wknd-universal/CTAByPath';
  const contentPath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim();
  const variationname = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim()?.toLowerCase()?.replace(' ', '_') || 'master';
  block.innerHTML = '';
  const isAuthor = isAuthorEnvironment();

	// Prepare request configuration based on environment
	const requestConfig = isAuthor 
  ? {
      url: `${aemauthorurl}${CONFIG.GRAPHQL_QUERY};path=${contentPath};variation=${variationname};ts=${Date.now()}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  : {
      url: `${CONFIG.WRAPPER_SERVICE_URL}?${CONFIG.WRAPPER_SERVICE_PARAMS}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        graphQLPath: `${aempublishurl}${CONFIG.GRAPHQL_QUERY}`,
        cfPath: contentPath,
        variation: variationname
      })
    };

    try {
        // Fetch data
        const response = await fetch(requestConfig.url, {
          method: requestConfig.method,
          headers: requestConfig.headers,
          ...(requestConfig.body && { body: requestConfig.body })
        });

        if (!response.ok) {
					console.error(`error making cf graphql request:${response.status}`, {
	          error: error.message,
	          stack: error.stack,
	          contentPath,
	          variationname,
	          isAuthor
        	});
          block.innerHTML = '';
          return; // Exit early if response is not ok
        } 

        let offer;
        try {
          offer = await response.json();
        } catch (parseError) {
					console.error('Error parsing offer JSON from response:', {
	          error: error.message,
	          stack: error.stack,
	          contentPath,
	          variationname,
	          isAuthor
        	});
          block.innerHTML = '';
          return;
        }

        const cfReq = offer?.data?.ctaByPath?.item;

        if (!cfReq) {
          console.error('Error parsing response from GraphQL request - no valid data found', {
            response: offer,
            contentPath,
            variationname
          });
          block.innerHTML = '';
          return; // Exit early if no valid data
        }
        // Set up block attributes
        const itemId = `urn:aemconnection:${contentPath}/jcr:content/data/${variationname}`;
        block.setAttribute('data-aue-type', 'container');
        const imgUrl = isAuthor ? cfReq.bannerimage?._authorUrl : cfReq.bannerimage?._publishUrl;

        block.innerHTML = `// Complete Question Authoring Portal as inline HTML
const questionAuthoringPortalHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Question Authoring Portal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            display: flex;
            gap: 20px;
            max-width: 1400px;
            margin: 0 auto;
            height: calc(100vh - 40px);
        }

        /* Left Sidebar - Questions List */
        .questions-sidebar {
            width: 300px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            padding: 20px;
            overflow-y: auto;
        }

        .sidebar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        }

        .sidebar-header h2 {
            color: #333;
            font-size: 1.5rem;
        }

        .question-count {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
        }

        .questions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .question-item {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        .question-item:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .question-item.active {
            border-color: #667eea;
            background: #e8f2ff;
        }

        .question-number {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }

        .question-preview {
            font-size: 0.9rem;
            color: #555;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .question-actions {
            display: flex;
            gap: 5px;
            margin-top: 10px;
        }

        .btn-small {
            padding: 4px 8px;
            font-size: 0.8rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-edit {
            background: #28a745;
            color: white;
        }

        .btn-delete {
            background: #dc3545;
            color: white;
        }

        .btn-small:hover {
            transform: scale(1.05);
        }

        .drag-handle {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: grab;
            color: #999;
            font-size: 1.2rem;
        }

        .drag-handle:active {
            cursor: grabbing;
        }

        /* Main Content Area */
        .main-content {
            flex: 1;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            padding: 30px;
            overflow-y: auto;
        }

        .content-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }

        .content-header h1 {
            color: #333;
            font-size: 2rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* Question Form */
        .question-form {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            border: 2px solid #e9ecef;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-control:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        textarea.form-control {
            resize: vertical;
            min-height: 100px;
        }

        .time-input {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .time-input input {
            width: 80px;
        }

        /* Options Section */
        .options-section {
            margin-top: 20px;
        }

        .options-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .options-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .option-item {
            display: flex;
            gap: 10px;
            align-items: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 2px solid #e9ecef;
        }

        .option-item:hover {
            border-color: #667eea;
        }

        .option-checkbox {
            width: 20px;
            height: 20px;
            accent-color: #667eea;
        }

        .option-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
        }

        .option-input:focus {
            outline: none;
            border-color: #667eea;
        }

        .btn-remove-option {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
        }

        .btn-remove-option:hover {
            background: #c82333;
        }

        .btn-add-option {
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-top: 10px;
        }

        .btn-add-option:hover {
            background: #218838;
        }

        /* Form Actions */
        .form-actions {
            display: flex;
            gap: 15px;
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
        }

        .btn-secondary {
            background: #6c757d;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: #5a6268;
        }

        .btn-success {
            background: #28a745;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-success:hover {
            background: #218838;
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
        }

        .empty-state h3 {
            margin-bottom: 15px;
            font-size: 1.5rem;
        }

        .empty-state p {
            font-size: 1.1rem;
            line-height: 1.6;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
                height: auto;
            }

            .questions-sidebar {
                width: 100%;
                order: 2;
            }

            .main-content {
                order: 1;
            }

            .content-header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
        }

        /* Animation for new questions */
        .question-item.new {
            animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Drag and drop styles */
        .question-item.dragging {
            opacity: 0.5;
            transform: rotate(5deg);
        }

        .drop-zone {
            border: 2px dashed #667eea;
            background: rgba(102, 126, 234, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Left Sidebar - Questions List -->
        <div class="questions-sidebar">
            <div class="sidebar-header">
                <h2>Questions</h2>
                <span class="question-count" id="questionCount">0</span>
            </div>
            <div class="questions-list" id="questionsList">
                <div class="empty-state">
                    <h3>No Questions Yet</h3>
                    <p>Start by adding your first question using the "Add Question" button.</p>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content">
            <div class="content-header">
                <h1>Question Authoring Portal</h1>
                <button class="btn-primary" onclick="addNewQuestion()">
                    <i class="fas fa-plus"></i> Add Question
                </button>
            </div>

            <div id="questionForms">
                <!-- Question forms will be dynamically added here -->
            </div>
        </div>
    </div>

    <script>
        let questions = [];
        let currentQuestionId = 0;

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            updateQuestionCount();
            setupDragAndDrop();
        });

        // Add a new question
        function addNewQuestion() {
            currentQuestionId++;
            const question = {
                id: currentQuestionId,
                question: '',
                timeLimit: 60,
                options: ['', '', '', ''],
                correctAnswers: []
            };
            
            questions.push(question);
            renderQuestionForm(question);
            updateQuestionsList();
            updateQuestionCount();
            
            // Scroll to the new question form
            const newForm = document.getElementById(\`question-\${question.id}\`);
            newForm.scrollIntoView({ behavior: 'smooth' });
        }

        // Render question form
        function renderQuestionForm(question) {
            const formsContainer = document.getElementById('questionForms');
            const formHtml = \`
                <div class="question-form" id="question-\${question.id}">
                    <h3>Question \${question.id}</h3>
                    
                    <div class="form-group">
                        <label for="question-text-\${question.id}">Question Text *</label>
                        <textarea 
                            class="form-control" 
                            id="question-text-\${question.id}" 
                            placeholder="Enter your question here..."
                            onchange="updateQuestion(\${question.id}, 'question', this.value)"
                        >\${question.question}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="time-limit-\${question.id}">Time Limit (seconds)</label>
                        <div class="time-input">
                            <input 
                                type="number" 
                                class="form-control" 
                                id="time-limit-\${question.id}" 
                                min="10" 
                                max="600" 
                                value="\${question.timeLimit}"
                                onchange="updateQuestion(\${question.id}, 'timeLimit', parseInt(this.value))"
                            >
                            <span>seconds</span>
                        </div>
                    </div>

                    <div class="options-section">
                        <div class="options-header">
                            <label>Answer Options *</label>
                            <button class="btn-add-option" onclick="addOption(\${question.id})">
                                <i class="fas fa-plus"></i> Add Option
                            </button>
                        </div>
                        
                        <div class="options-list" id="options-\${question.id}">
                            \${question.options.map((option, index) => \`
                                <div class="option-item">
                                    <input 
                                        type="checkbox" 
                                        class="option-checkbox" 
                                        id="correct-\${question.id}-\${index}"
                                        \${question.correctAnswers.includes(index) ? 'checked' : ''}
                                        onchange="toggleCorrectAnswer(\${question.id}, \${index}, this.checked)"
                                    >
                                    <input 
                                        type="text" 
                                        class="option-input" 
                                        placeholder="Option \${index + 1}"
                                        value="\${option}"
                                        onchange="updateOption(\${question.id}, \${index}, this.value)"
                                    >
                                    \${question.options.length > 2 ? \`
                                        <button class="btn-remove-option" onclick="removeOption(\${question.id}, \${index})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    \` : ''}
                                </div>
                            \`).join('')}
                        </div>
                    </div>

                    <div class="form-actions">
                        <button class="btn-secondary" onclick="deleteQuestion(\${question.id})">
                            <i class="fas fa-trash"></i> Delete Question
                        </button>
                        <button class="btn-success" onclick="saveQuestion(\${question.id})">
                            <i class="fas fa-save"></i> Save Question
                        </button>
                    </div>
                </div>
            \`;
            
            formsContainer.insertAdjacentHTML('beforeend', formHtml);
        }

        // Update question data
        function updateQuestion(id, field, value) {
            const question = questions.find(q => q.id === id);
            if (question) {
                question[field] = value;
                updateQuestionsList();
            }
        }

        // Update option
        function updateOption(questionId, optionIndex, value) {
            const question = questions.find(q => q.id === questionId);
            if (question && question.options[optionIndex] !== undefined) {
                question.options[optionIndex] = value;
                updateQuestionsList();
            }
        }

        // Toggle correct answer
        function toggleCorrectAnswer(questionId, optionIndex, isCorrect) {
            const question = questions.find(q => q.id === questionId);
            if (question) {
                if (isCorrect) {
                    if (!question.correctAnswers.includes(optionIndex)) {
                        question.correctAnswers.push(optionIndex);
                    }
                } else {
                    question.correctAnswers = question.correctAnswers.filter(index => index !== optionIndex);
                }
                updateQuestionsList();
            }
        }

        // Add option
        function addOption(questionId) {
            const question = questions.find(q => q.id === questionId);
            if (question) {
                question.options.push('');
                reRenderQuestionForm(questionId);
            }
        }

        // Remove option
        function removeOption(questionId, optionIndex) {
            const question = questions.find(q => q.id === questionId);
            if (question && question.options.length > 2) {
                question.options.splice(optionIndex, 1);
                // Update correct answers indices
                question.correctAnswers = question.correctAnswers
                    .filter(index => index !== optionIndex)
                    .map(index => index > optionIndex ? index - 1 : index);
                reRenderQuestionForm(questionId);
            }
        }

        // Re-render question form
        function reRenderQuestionForm(questionId) {
            const question = questions.find(q => q.id === questionId);
            if (question) {
                const formElement = document.getElementById(\`question-\${questionId}\`);
                if (formElement) {
                    formElement.remove();
                    renderQuestionForm(question);
                }
            }
        }

        // Delete question
        function deleteQuestion(id) {
            if (confirm('Are you sure you want to delete this question?')) {
                questions = questions.filter(q => q.id !== id);
                const formElement = document.getElementById(\`question-\${id}\`);
                if (formElement) {
                    formElement.remove();
                }
                updateQuestionsList();
                updateQuestionCount();
            }
        }

        // Save question
        function saveQuestion(id) {
            const question = questions.find(q => q.id === id);
            if (question) {
                // Validate question
                if (!question.question.trim()) {
                    alert('Please enter a question text.');
                    return;
                }
                
                if (question.options.filter(opt => opt.trim()).length < 2) {
                    alert('Please provide at least 2 options.');
                    return;
                }
                
                if (question.correctAnswers.length === 0) {
                    alert('Please select at least one correct answer.');
                    return;
                }
                
                alert('Question saved successfully!');
                updateQuestionsList();
            }
        }

        // Update questions list in sidebar
        function updateQuestionsList() {
            const questionsList = document.getElementById('questionsList');
            
            if (questions.length === 0) {
                questionsList.innerHTML = \`
                    <div class="empty-state">
                        <h3>No Questions Yet</h3>
                        <p>Start by adding your first question using the "Add Question" button.</p>
                    </div>
                \`;
                return;
            }
            
            questionsList.innerHTML = questions.map((question, index) => \`
                <div class="question-item" data-id="\${question.id}" draggable="true">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="question-number">Question \${index + 1}</div>
                    <div class="question-preview">\${question.question || 'No question text'}</div>
                    <div class="question-actions">
                        <button class="btn-small btn-edit" onclick="editQuestion(\${question.id})">Edit</button>
                        <button class="btn-small btn-delete" onclick="deleteQuestion(\${question.id})">Delete</button>
                    </div>
                </div>
            \`).join('');
        }

        // Edit question (scroll to form)
        function editQuestion(id) {
            const formElement = document.getElementById(\`question-\${id}\`);
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
                formElement.style.borderColor = '#667eea';
                setTimeout(() => {
                    formElement.style.borderColor = '#e9ecef';
                }, 2000);
            }
        }

        // Update question count
        function updateQuestionCount() {
            const countElement = document.getElementById('questionCount');
            countElement.textContent = questions.length;
        }

        // Setup drag and drop functionality
        function setupDragAndDrop() {
            const questionsList = document.getElementById('questionsList');
            
            questionsList.addEventListener('dragover', function(e) {
                e.preventDefault();
                const draggingItem = document.querySelector('.dragging');
                if (draggingItem) {
                    const afterElement = getDragAfterElement(questionsList, e.clientY);
                    if (afterElement) {
                        questionsList.insertBefore(draggingItem, afterElement);
                    } else {
                        questionsList.appendChild(draggingItem);
                    }
                }
            });
            
            questionsList.addEventListener('dragstart', function(e) {
                if (e.target.classList.contains('question-item')) {
                    e.target.classList.add('dragging');
                }
            });
            
            questionsList.addEventListener('dragend', function(e) {
                if (e.target.classList.contains('question-item')) {
                    e.target.classList.remove('dragging');
                    updateQuestionsOrder();
                }
            });
        }

        // Get element after which to drop
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.question-item:not(.dragging)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        // Update questions order after drag and drop
        function updateQuestionsOrder() {
            const questionItems = document.querySelectorAll('.question-item');
            const newOrder = [];
            
            questionItems.forEach(item => {
                const id = parseInt(item.dataset.id);
                const question = questions.find(q => q.id === id);
                if (question) {
                    newOrder.push(question);
                }
            });
            
            questions = newOrder;
            updateQuestionsList();
        }

        // Export questions (you can modify this to save to your backend)
        function exportQuestions() {
            const validQuestions = questions.filter(q => 
                q.question.trim() && 
                q.options.filter(opt => opt.trim()).length >= 2 && 
                q.correctAnswers.length > 0
            );
            
            if (validQuestions.length === 0) {
                alert('No valid questions to export. Please add and save some questions first.');
                return;
            }
            
            const exportData = {
                quiz: {
                    title: 'My Quiz',
                    questions: validQuestions.map((q, index) => ({
                        id: index + 1,
                        question: q.question,
                        timeLimit: q.timeLimit,
                        options: q.options.filter(opt => opt.trim()),
                        correctAnswers: q.correctAnswers
                    }))
                }
            };
            
            console.log('Export Data:', exportData);
            alert(\`Successfully exported \${validQuestions.length} questions! Check console for data.\`);
        }

        // Add export button to header
        document.addEventListener('DOMContentLoaded', function() {
            const header = document.querySelector('.content-header');
            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn-primary';
            exportBtn.style.marginLeft = '10px';
            exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Quiz';
            exportBtn.onclick = exportQuestions;
            header.appendChild(exportBtn);
        });
    </script>

    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</body>
</html>
`;

// Usage example:
// block.innerHTML = questionAuthoringPortalHTML;`;
        
    
      } catch (error) {
        console.error('Error rendering content fragment:', {
          error: error.message,
          stack: error.stack,
          contentPath,
          variationname,
          isAuthor
        });
        block.innerHTML = '';
      }

	/*
  if (!isAuthor) {
    moveInstrumentation(block, null);
    block.querySelectorAll('*').forEach((elem) => moveInstrumentation(elem, null));
  }
	*/
}
