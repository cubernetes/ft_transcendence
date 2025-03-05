let ws: WebSocket | null = null; // Global WebSocket reference

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

    startButton.addEventListener('click', () => {
        if (ws && ws.readyState === WebSocket.OPEN) return; // Prevent multiple connections

        ws = new WebSocket('ws://localhost:8080/ws');

        ws.onopen = () => {
            console.log('WebSocket connected!');
            ws!.send('Hello Server!');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = (event) => {
            console.log('WebSocket connection closed:', event);
            ws = null; // Allow reconnection
        };

        ws.onmessage = (event) => {
            try {
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
                        const playerHTMLElement = playerElement as HTMLElement;
                        playerHTMLElement.style.left = `${data.position.x}px`;
                        playerHTMLElement.style.top = `${data.position.y}px`;
                    }
                }
            } catch (error) {
                console.error("Invalid WebSocket message:", error);
            }
        };

        // Send player movement direction to the server
        document.addEventListener('keydown', (event) => {
            if (!ws || ws.readyState !== WebSocket.OPEN) return;

            let direction: string | null = null;
            if (event.key === 'ArrowUp') direction = 'up';
            if (event.key === 'ArrowDown') direction = 'down';
            if (event.key === 'ArrowLeft') direction = 'left';
            if (event.key === 'ArrowRight') direction = 'right';

            if (direction) {
                ws.send(JSON.stringify({ type: 'move', direction }));
            }
        });

        startButton.remove(); // Remove start button after game starts
    });

    gameContainer.appendChild(startButton);
    section.appendChild(title);
    section.appendChild(gameContainer);

    return section;
}
