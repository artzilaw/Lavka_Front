/**
 * @module config
 */

const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
);

const backendHost = isLocal
    ? 'http://localhost:8000'
    : 'http://lavka-go.ru:8000';

const CONFIG = {
    API: {
        BASE_URL: backendHost,
        API_URL: `${backendHost}/api/v1`,
    },
    APP: {
        NAME: 'Лавка',
        VERSION: '1.0.0'
    }
};

export { CONFIG };
