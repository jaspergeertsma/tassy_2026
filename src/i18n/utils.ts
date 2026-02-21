
import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
    const parts = url.pathname.split('/').filter(Boolean);
    // parts[0] is 'tassy_2026'
    // parts[1] could be 'nl'
    if (parts[1] && parts[1] in ui) return parts[1] as keyof typeof ui;
    return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
    return function t(key: keyof typeof ui[typeof defaultLang]) {
        return ui[lang][key] || ui[defaultLang][key];
    }
}

export function useLocalizedPath(lang: keyof typeof ui) {
    return function lp(path: string) {
        const base = '/tassy_2026';
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        // Default locale is at root (English)
        if (lang === defaultLang) {
            return `${base}${cleanPath}`;
        }

        // Other locales are prefixed
        return `${base}/${lang}${cleanPath}`;
    }
}

export function useLanguageSwitcher(url: URL) {
    return function ls(targetLang: keyof typeof ui) {
        const parts = url.pathname.split('/').filter(Boolean);
        // parts[0] is 'tassy_2026'

        let remainingParts;
        if (parts[1] && parts[1] in ui && parts[1] !== defaultLang) {
            remainingParts = parts.slice(2);
        } else {
            remainingParts = parts.slice(1);
        }

        const base = '/tassy_2026';
        const path = remainingParts.join('/');
        const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

        if (targetLang === defaultLang) {
            return `${base}${cleanPath}`;
        }

        return `${base}/${targetLang}${cleanPath}`;
    }
}
