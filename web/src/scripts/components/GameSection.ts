export function createGameSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'p-4';

  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold mb-4';
  title.textContent = 'Pong Game';

  const gameContainer = document.createElement('div');
  gameContainer.className = 'bg-black h-80 rounded-lg flex items-center justify-center relative';
  gameContainer.id = 'game-container';

  // Create a ball element for the Pong game
  const ball = document.createElement('div');
  ball.className = 'absolute bg-white rounded-full';
  ball.style.width = '20px';
  ball.style.height = '20px';
  ball.style.top = '50%';  // Center the ball vertically
  ball.style.left = '50%'; // Center the ball horizontally
  gameContainer.appendChild(ball);

  // Create paddles
  const playerPaddle = document.createElement('div');
  playerPaddle.className = 'absolute bg-white';
  playerPaddle.style.width = '10px';
  playerPaddle.style.height = '80px';
  playerPaddle.style.left = '10px'; // Example left position for player paddle
  gameContainer.appendChild(playerPaddle);

  const opponentPaddle = document.createElement('div');
  opponentPaddle.className = 'absolute bg-white';
  opponentPaddle.style.width = '10px';
  opponentPaddle.style.height = '80px';
  opponentPaddle.style.right = '10px'; // Example right position for opponent paddle
  gameContainer.appendChild(opponentPaddle);

  // WebSocket setup
  const socket = new WebSocket('ws://localhost:8080/ws');

  socket.onopen = () => {
    console.log('WebSocket connection established.');
    socket.send("ping");  // Send a test message
  };

  socket.onmessage = (event) => {
    console.log('Message from server:', event.data);

    // Handle game state updates (like ball position, paddle position, score)
    const gameState = JSON.parse(event.data);

    if (gameState) {
      // Update ball position
      if (gameState.ballPosition) {
        ball.style.top = `${gameState.ballPosition.y}px`;
        ball.style.left = `${gameState.ballPosition.x}px`;
      }

      // Update paddle positions
      if (gameState.paddlePosition) {
        const playerPaddlePos = gameState.paddlePosition['player-1']; // Example playerId
        if (playerPaddlePos === 'up') {
          playerPaddle.style.top = '10px'; // Move to the top
        } else if (playerPaddlePos === 'down') {
          playerPaddle.style.top = `${gameContainer.clientHeight - 80}px`; // Move to the bottom
        }

        const opponentPaddlePos = gameState.paddlePosition['player-2']; // Example opponentId
        if (opponentPaddlePos === 'up') {
          opponentPaddle.style.top = '10px'; // Move to the top
        } else if (opponentPaddlePos === 'down') {
          opponentPaddle.style.top = `${gameContainer.clientHeight - 80}px`; // Move to the bottom
        }
      }

      // Update the score
      if (gameState.score) {
        console.log(`Score: Player 1 - ${gameState.score.player1}, Player 2 - ${gameState.score.player2}`);
      }
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed.');
  };

  // Handle keyboard inputs for paddle movement
  let paddleMoving = { up: false, down: false };

  const movePaddleUp = () => {
    if (socket.readyState === WebSocket.OPEN && !paddleMoving.up) {
      socket.send('move up');
      paddleMoving.up = true;
    }
  };

  const movePaddleDown = () => {
    if (socket.readyState === WebSocket.OPEN && !paddleMoving.down) {
      socket.send('move down');
      paddleMoving.down = true;
    }
  };

  const stopPaddleMovement = () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send('move stop');
    }
    paddleMoving = { up: false, down: false };
  };

  // Add event listeners for keyboard input (arrow keys)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      movePaddleUp();
    }
    if (event.key === 'ArrowDown') {
      movePaddleDown();
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      stopPaddleMovement();
    }
  });

  // Button to send a test message
  const startButton = document.createElement('button');
  startButton.className = 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600';
  startButton.textContent = 'Start Game';
  startButton.addEventListener('click', () => {
    // Update UI instead of clearing game elements
    const startMessage = document.createElement('p');
    startMessage.className = 'text-white';
    startMessage.textContent = 'Game started! Use arrow keys to move your paddle.';

    gameContainer.appendChild(startMessage);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send('startPong');  // Start the game
    } else {
      console.error('WebSocket is not open.');
    }
  });

  gameContainer.appendChild(startButton);
  section.appendChild(title);
  section.appendChild(gameContainer);

  return section;
}
