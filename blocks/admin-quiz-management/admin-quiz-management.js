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
 // renderDashboard();
}
