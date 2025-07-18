import { getMetadata } from '../../scripts/aem.js';
import { isAuthorEnvironment, moveInstrumentation } from '../../scripts/scripts.js';

let questions = [];
let currentQuestionId = 0;

// Make functions globally accessible for onclick handlers
window.addNewQuestion = function() {
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
};

window.updateQuestion = function(id, field, value) {
    const question = questions.find(q => q.id === id);
    if (question) {
        question[field] = value;
        updateQuestionsList();
    }
};

window.updateOption = function(questionId, optionIndex, value) {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options[optionIndex] !== undefined) {
        question.options[optionIndex] = value;
        updateQuestionsList();
    }
};

window.toggleCorrectAnswer = function(questionId, optionIndex, isCorrect) {
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
};

window.addOption = function(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.options.push('');
        reRenderQuestionForm(questionId);
    }
};

window.removeOption = function(questionId, optionIndex) {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options.length > 2) {
        question.options.splice(optionIndex, 1);
        // Update correct answers indices
        question.correctAnswers = question.correctAnswers
            .filter(index => index !== optionIndex)
            .map(index => index > optionIndex ? index - 1 : index);
        reRenderQuestionForm(questionId);
    }
};

window.deleteQuestion = function(id) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions = questions.filter(q => q.id !== id);
        const formElement = document.getElementById(`question-${id}`);
        if (formElement) {
            formElement.remove();
        }
        updateQuestionsList();
        updateQuestionCount();
    }
};

window.saveQuestion = function(id) {
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
};

window.editQuestion = function(id) {
    const formElement = document.getElementById(`question-${id}`);
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
        formElement.style.borderColor = '#667eea';
        setTimeout(() => {
            formElement.style.borderColor = '#e9ecef';
        }, 2000);
    }
};

// Internal functions (not exposed globally)
function renderQuestionForm(question) {
    const formsContainer = document.getElementById('questionForms');
    const formHtml = `
        <div class="question-form" id="question-${question.id}">
            <h3>Question ${question.id}</h3>
            
            <div class="form-group">
                <label for="question-text-${question.id}">Question Text *</label>
                <textarea 
                    class="form-control" 
                    id="question-text-${question.id}" 
                    placeholder="Enter your question here..."
                    onchange="updateQuestion(${question.id}, 'question', this.value)"
                >${question.question}</textarea>
            </div>

            <div class="form-group">
                <label for="time-limit-${question.id}">Time Limit (seconds)</label>
                <div class="time-input">
                    <input 
                        type="number" 
                        class="form-control" 
                        id="time-limit-${question.id}" 
                        min="10" 
                        max="600" 
                        value="${question.timeLimit}"
                        onchange="updateQuestion(${question.id}, 'timeLimit', parseInt(this.value))"
                    >
                    <span>seconds</span>
                </div>
            </div>

            <div class="options-section">
                <div class="options-header">
                    <label>Answer Options *</label>
                    <button class="btn-add-option" onclick="addOption(${question.id})">
                        <i class="fas fa-plus"></i> Add Option
                    </button>
                </div>
                
                <div class="options-list" id="options-${question.id}">
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

function updateQuestionCount() {
    const countElement = document.getElementById('questionCount');
    if (countElement) {
        countElement.textContent = questions.length;
    }
}

function setupDragAndDrop() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;
    
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

// Initialize the application
function initializeQuizBuilder() {
    updateQuestionCount();
    setupDragAndDrop();
}

/**
 * AEM EDS Block Decorator Function
 * @param {Element} block
 */
export default async function decorate(block) {
    try {
        const questionAuthoringPortalHTML = `
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
        `;

        block.innerHTML = questionAuthoringPortalHTML;
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeQuizBuilder);
        } else {
            initializeQuizBuilder();
        }
        
    } catch (error) {
        console.error('Error rendering quiz builder:', {
            error: error.message,
            stack: error.stack
        });
        block.innerHTML = '<p>Error loading quiz builder</p>';
    }
}
