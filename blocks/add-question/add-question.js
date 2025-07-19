import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  
  // Create container for the authored content
  const container = document.createElement('div');
  container.className = 'add-question-content';
  
  // Display the authored text
  if (config.text) {
    container.innerHTML = config.text;
  }
  
  // Clear block and add the new content
  block.innerHTML = '';
  block.appendChild(container);
}