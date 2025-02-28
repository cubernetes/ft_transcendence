import '../../dist/styles/output.css';

const greeting: string = "Welcome to my web app!";
document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        appElement.innerHTML = `<h1 class="text-3xl font-bold underline">${greeting}</h1>`;
    }
});
