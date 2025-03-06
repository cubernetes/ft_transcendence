export function createGameSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'p-4';

  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold mb-4';
  title.textContent = 'Pong Game';

  const gameContainer = document.createElement('div');
  gameContainer.className = 'bg-black h-80 rounded-lg flex items-center justify-center';
  gameContainer.id = 'game-container';

  // WebSocket setup
  const socket = new WebSocket('ws://localhost:8080/ws');

  socket.onopen = () => {
    console.log('WebSocket connection established.');
    socket.send("ping");  // Send a test message
  };

  socket.onmessage = (event) => {
    console.log('Message from server:', event.data);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed.');
  };

  // Button to send a test message
  const startButton = document.createElement('button');
  startButton.className = 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600';
  startButton.textContent = 'Start Game';
  startButton.addEventListener('click', () => {
    gameContainer.innerHTML = '<p class="text-white">Game started!</p>';

    if (socket.readyState === WebSocket.OPEN) {
      socket.send('Hello from frontend!');
    } else {
      console.error('WebSocket is not open.');
    }
  });

  gameContainer.appendChild(startButton);
  section.appendChild(title);
  section.appendChild(gameContainer);

  return section;
}
