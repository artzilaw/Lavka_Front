/**
 * @module main
 */

import './utils/storage.js';
import './validators/authValidator.js';
import './services/authService.js';
import './services/adsServices.js';
import './api/apiClient.js';
import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => App.init());
