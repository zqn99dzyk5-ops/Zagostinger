import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from './api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: 'Continental Academy',
    logo_url: '',
    favicon_url: '',
    hero_video_url: '',
    hero_headline: '',
    hero_subheadline: '',
    discord_invite_url: '',
    theme: 'dark-luxury',
    social_links: {},
    contact_email: '',
    contact_phone: '',
    footer_text: '',
    show_results_section: true,
    show_faq_section: true,
    currency: 'EUR'
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data);
      
      // Apply theme
      if (response.data.theme) {
        applyTheme(response.data.theme);
      }
      
      // Update favicon dynamically
      if (response.data.favicon_url) {
        updateFavicon(response.data.favicon_url);
      }
      
      // Update document title
      if (response.data.site_name) {
        document.title = response.data.site_name;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme) => {
    // Remove any existing theme
    document.documentElement.removeAttribute('data-theme');
    // Apply new theme
    document.documentElement.setAttribute('data-theme', theme);
    // Store in localStorage for persistence
    localStorage.setItem('theme', theme);
  };

  const updateFavicon = (url) => {
    // Remove existing favicons
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach(favicon => favicon.remove());
    
    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = url;
    document.head.appendChild(link);
    
    // Also add apple touch icon
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = url;
    document.head.appendChild(appleLink);
  };

  useEffect(() => {
    // Apply cached theme immediately to prevent flash
    const cachedTheme = localStorage.getItem('theme');
    if (cachedTheme) {
      applyTheme(cachedTheme);
    }
    loadSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      const response = await settingsAPI.update(newSettings);
      if (response.data) {
        setSettings(response.data);
        
        // Apply theme if changed
        if (response.data.theme) {
          applyTheme(response.data.theme);
        }
        
        // Update favicon if changed
        if (response.data.favicon_url) {
          updateFavicon(response.data.favicon_url);
        }
        
        // Update title if changed
        if (response.data.site_name) {
          document.title = response.data.site_name;
        }
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSettings, refreshSettings: loadSettings, applyTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
