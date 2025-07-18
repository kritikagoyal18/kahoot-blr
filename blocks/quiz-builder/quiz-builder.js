import { getMetadata } from '../../scripts/aem.js';
import { isAuthorEnvironment, moveInstrumentation } from '../../scripts/scripts.js';


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
		const newForm = document.getElementById(`question-${question.id}`);
		newForm.scrollIntoView({ behavior: 'smooth' });
}

function renderQuestionForm(question) {
		const formsContainer = document.getElementById('questionForms');
		const formHtml = `
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
										${question.options.map((option, index) => `
												<div class="option-item">
														<input 
																type="checkbox" 
																class="option-checkbox" 
																id="correct-${question.id}-${index}"
																${question.correctAnswers.includes(index) ? 'checked' : ''}
																onchange="toggleCorrectAnswer(${question.id}, ${index}, this.checked)"
														>
														<input 
																type="text" 
																class="option-input" 
																placeholder="Option ${index + 1}"
																value="${option}"
																onchange="updateOption(${question.id}, ${index}, this.value)"
														>
														${question.options.length > 2 ? `
																<button class="btn-remove-option" onclick="removeOption(${question.id}, ${index})">
																		<i class="fas fa-trash"></i>
																</button>
														` : ''}
												</div>
										`).join('')}
								</div>
						</div>

						<div class="form-actions">
								<button class="btn-secondary" onclick="deleteQuestion(${question.id})">
										<i class="fas fa-trash"></i> Delete Question
								</button>
								<button class="btn-success" onclick="saveQuestion(${question.id})">
										<i class="fas fa-save"></i> Save Question
								</button>
						</div>
				</div>
		`;
		
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
				const formElement = document.getElementById(`question-${questionId}`);
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
				const formElement = document.getElementById(`question-${id}`);
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
				questionsList.innerHTML = `
						<div class="empty-state">
								<h3>No Questions Yet</h3>
								<p>Start by adding your first question using the "Add Question" button.</p>
						</div>
				`;
				return;
		}
		
		questionsList.innerHTML = questions.map((question, index) => `
				<div class="question-item" data-id="${question.id}" draggable="true">
						<div class="drag-handle">⋮⋮</div>
						<div class="question-number">Question ${index + 1}</div>
						<div class="question-preview">${question.question || 'No question text'}</div>
						<div class="question-actions">
								<button class="btn-small btn-edit" onclick="editQuestion(${question.id})">Edit</button>
								<button class="btn-small btn-delete" onclick="deleteQuestion(${question.id})">Delete</button>
						</div>
				</div>
		`).join('');
}

// Edit question (scroll to form)
function editQuestion(id) {
		const formElement = document.getElementById(`question-${id}`);
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
		alert(`Successfully exported ${validQuestions.length} questions! Check console for data.`);
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

/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
        block.innerHTML = `
			<div class="container">
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
		`;        
}
