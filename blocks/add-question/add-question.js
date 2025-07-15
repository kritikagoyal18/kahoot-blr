// Add Question Block Script

document.addEventListener('DOMContentLoaded', () => {
  const block = document.querySelector('.add-question');
  if (!block) return;

  // State: Array of question objects
  let questions = [];

  // Create and append the Add Question button
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.textContent = 'Add Question';
  addButton.className = 'add-question-btn';
  block.appendChild(addButton);

  // Container for all question panels
  const panelContainer = document.createElement('div');
  panelContainer.className = 'question-panels';
  block.appendChild(panelContainer);

  // Helper: Create the third field based on type
  function createDependableField(type, panelIndex, value = {}) {
    const container = document.createElement('div');
    container.className = 'dependable-field';
    container.innerHTML = '';
    if (type === 'boolean') {
      // True/False radio
      const trueLabel = document.createElement('label');
      const trueRadio = document.createElement('input');
      trueRadio.type = 'radio';
      trueRadio.name = `boolean-${panelIndex}`;
      trueRadio.value = 'true';
      trueRadio.checked = value.answer === 'true';
      trueLabel.appendChild(trueRadio);
      trueLabel.appendChild(document.createTextNode('True'));

      const falseLabel = document.createElement('label');
      const falseRadio = document.createElement('input');
      falseRadio.type = 'radio';
      falseRadio.name = `boolean-${panelIndex}`;
      falseRadio.value = 'false';
      falseRadio.checked = value.answer === 'false';
      falseLabel.appendChild(falseRadio);
      falseLabel.appendChild(document.createTextNode('False'));

      container.appendChild(trueLabel);
      container.appendChild(falseLabel);

      // Event listeners
      [trueRadio, falseRadio].forEach(radio => {
        radio.addEventListener('change', (e) => {
          questions[panelIndex].dependable = { answer: e.target.value };
        });
      });
    } else if (type === 'single') {
      // Single answer input
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter answer';
      input.value = value.answer || '';
      input.addEventListener('input', (e) => {
        questions[panelIndex].dependable = { answer: e.target.value };
      });
      container.appendChild(input);
    } else if (type === 'mcq') {
      // Multiple options
      const options = value.options || ['',''];
      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'mcq-options';
      options.forEach((opt, idx) => {
        const optDiv = document.createElement('div');
        optDiv.className = 'mcq-option';
        const optInput = document.createElement('input');
        optInput.type = 'text';
        optInput.placeholder = `Option ${idx+1}`;
        optInput.value = opt;
        optInput.addEventListener('input', (e) => {
          questions[panelIndex].dependable.options[idx] = e.target.value;
        });
        // Remove option button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          if (questions[panelIndex].dependable.options.length > 2) {
            questions[panelIndex].dependable.options.splice(idx, 1);
            renderPanels();
          }
        });
        optDiv.appendChild(optInput);
        if (options.length > 2) optDiv.appendChild(removeBtn);
        optionsContainer.appendChild(optDiv);
      });
      // Add option button
      const addOptBtn = document.createElement('button');
      addOptBtn.type = 'button';
      addOptBtn.textContent = 'Add Option';
      addOptBtn.addEventListener('click', () => {
        questions[panelIndex].dependable.options.push('');
        renderPanels();
      });
      container.appendChild(optionsContainer);
      container.appendChild(addOptBtn);
    }
    return container;
  }

  // Helper: Render all panels
  function renderPanels() {
    panelContainer.innerHTML = '';
    questions.forEach((q, idx) => {
      const panel = document.createElement('div');
      panel.className = 'question-panel';

      // Question input
      const qInput = document.createElement('input');
      qInput.type = 'text';
      qInput.placeholder = 'Enter question';
      qInput.value = q.question;
      qInput.addEventListener('input', (e) => {
        questions[idx].question = e.target.value;
      });
      panel.appendChild(qInput);

      // Type dropdown
      const typeSelect = document.createElement('select');
      [
        { value: 'boolean', label: 'Boolean' },
        { value: 'single', label: 'Single Choice' },
        { value: 'mcq', label: 'MCQ' },
      ].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (q.type === opt.value) option.selected = true;
        typeSelect.appendChild(option);
      });
      typeSelect.addEventListener('change', (e) => {
        questions[idx].type = e.target.value;
        // Reset dependable field
        if (e.target.value === 'boolean') {
          questions[idx].dependable = { answer: '' };
        } else if (e.target.value === 'single') {
          questions[idx].dependable = { answer: '' };
        } else if (e.target.value === 'mcq') {
          questions[idx].dependable = { options: ['', ''] };
        }
        renderPanels();
      });
      panel.appendChild(typeSelect);

      // Dependable field
      panel.appendChild(createDependableField(q.type, idx, q.dependable));

      // Remove panel button
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Remove';
      removeBtn.className = 'remove-panel-btn';
      removeBtn.addEventListener('click', () => {
        questions.splice(idx, 1);
        renderPanels();
      });
      panel.appendChild(removeBtn);

      panelContainer.appendChild(panel);
    });
  }

  // Add Question button handler
  addButton.addEventListener('click', () => {
    questions.push({
      question: '',
      type: 'boolean',
      dependable: { answer: '' },
    });
    renderPanels();
  });

  // Initial render (no panels)
  renderPanels();
});
