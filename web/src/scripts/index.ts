import '../../dist/styles/output.css';
import { createRouter } from './router/Router';

function launchSite(): void {
    const appElement = document.getElementById('app');
    if (appElement) {
        createRouter(appElement);
    }
}

document.addEventListener('DOMContentLoaded', launchSite);