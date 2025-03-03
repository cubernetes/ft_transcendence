export function createGameSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'p-4';
  
  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold mb-4';
  title.textContent = 'Pong Game';
  
  const gameContainer = document.createElement('div');
  gameContainer.className = 'bg-black h-80 rounded-lg flex items-center justify-center';
  gameContainer.id = 'game-container';
  
  const startButton = document.createElement('button');
  startButton.className = 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600';
  startButton.textContent = 'Start Game';
  startButton.addEventListener('click', () => {
    // Game initialization logic would go here
    gameContainer.innerHTML = '<p class="text-white">Game started!</p>';
  });
  
  gameContainer.appendChild(startButton);
  section.appendChild(title);
  section.appendChild(gameContainer);
  
  return section;
} 