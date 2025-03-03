const API_BASE_URL = 'http://localhost:3000';

export async function fetchTestData() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();

        const processedData = data.map((p: Record<string, any>) => ({
            id: p.id,
            name: p.username,
            wins: p.wins,
            losses: p.losses
        })).sort((a: Record<string, any>, b: Record<string, any>) => b.wins - a.wins)
        .map((p: Record<string, any>, i: number) => ({
            ...p,
            rank: i + 1
        }))

        console.log('Response data:', data);
        return processedData;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}