/**
 * @module adsServices
 */

import { CONFIG } from "../core/config.js";

const AdsService = {
    API_URL: CONFIG.API.API_URL,

    /**
     * @returns {Promise<Object>}
     */
    async getAllAds() {
        try {
            const response = await fetch(`${this.API_URL}/ads`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки объявлений');
            }

            const data = await response.json();
            return {
                success: true,
                ads: data
            };
        } catch {
            return {
                success: false,
                error: 'Не удалось загрузить объявления'
            };
        }
    },

    /**
     * @param {number|string} id
     * @returns {Promise<Object>}
     */
    async getAdById(id) {
        try {
            const response = await fetch(`${this.API_URL}/ads/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Объявление не найдено');
            }

            const data = await response.json();
            return {
                success: true,
                ad: data
            };
        } catch {
            return {
                success: false,
                error: 'Не удалось загрузить объявление'
            };
        }
    },

    /**
     * @param {Object} ad
     * @returns {Object}
     */
    formatAdCard(ad) {
        const firstPhoto = ad.photos?.[0] || '';

        let imageUrl = '/images/placeholder.jpg';
        if (firstPhoto) {
            imageUrl = firstPhoto.startsWith('http')
                ? firstPhoto
                : `${CONFIG.API.BASE_URL}${firstPhoto}`;
        }

        return {
            id: ad.id,
            title: ad.title,
            description: ad.description ? ad.description.substring(0, 100) + '...' : '',
            price: ad.price === 0 ? 'Бесплатно' : ad.price.toLocaleString('ru-RU') + ' ₽',
            location: ad.location || 'Не указано',
            image: imageUrl,
            views: ad.views_count || 0,
            favorites: ad.favorites_count || 0,
            date: ad.created_at ? new Date(ad.created_at).toLocaleDateString('ru-RU') : ''
        };
    }
};

export { AdsService };
