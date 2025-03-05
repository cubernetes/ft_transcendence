export function createGameSection(): HTMLElement {
    const section = document.createElement('section');
    section.className = 'p-4';
  
    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold mb-4';
    title.textContent = 'Pong Game';
  
    const gameContainer = document.createElement('div');
    gameContainer.className = 'bg-black h-80 rounded-lg flex items-center justify-center relative overflow-hidden';
    gameContainer.id = 'game-container';
  
    const player = document.createElement('div');
    player.className = 'absolute w-8 h-8 bg-white rounded-full';
    player.style.left = '50px';
    player.style.top = '50px';
  
    gameContainer.appendChild(player);
  
    const startButton = document.createElement('button');
    startButton.className = 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600';
    startButton.textContent = 'Start Game';
  
    let ws: WebSocket | null = null;
  
    startButton.addEventListener('click', () => {
        if (ws) return; // Prevent multiple connections
  
        // Initialize the WebSocket connection (simplified for POC)
        ws = new WebSocket('ws://localhost:8080/ws');  // WebSocket URL (no token)
    
        ws.onopen = () => {
            console.log('WebSocket connected!');
        };
  
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.event === 'init') {
                // Handle the initial positions of all players
                data.allPlayers.forEach((playerData: any) => {
                    const newPlayer = document.createElement('div');
                    newPlayer.className = 'absolute w-8 h-8 bg-white rounded-full';
                    newPlayer.style.left = `${playerData.position.x}px`;
                    newPlayer.style.top = `${playerData.position.y}px`;
                    newPlayer.id = `player-${playerData.playerId}`;
                    gameContainer.appendChild(newPlayer);
                });
            } else if (data.event === 'playerMove') {
                // Handle player movement
                const playerElement = document.querySelector(`#player-${data.playerId}`);
                if (playerElement) {
                    // Type assertion to HTMLElement
                    const playerHTMLElement = playerElement as HTMLElement;
                    playerHTMLElement.style.left = `${data.position.x}px`;
                    playerHTMLElement.style.top = `${data.position.y}px`;
                }
            }
        };
  
        // Send player movement direction to the server
        document.addEventListener('keydown', (event) => {
            if (!ws) return;
  
            let direction: string | null = null;
            if (event.key === 'ArrowUp') direction = 'up';
            if (event.key === 'ArrowDown') direction = 'down';
            if (event.key === 'ArrowLeft') direction = 'left';
            if (event.key === 'ArrowRight') direction = 'right';
  
            if (direction) {
                ws.send(JSON.stringify({ type: 'move', direction }));
            }
        });
  
        // Remove start button once the game starts
        startButton.remove();
    });
  
    gameContainer.appendChild(startButton);
    section.appendChild(title);
    section.appendChild(gameContainer);
  
    return section;
}
