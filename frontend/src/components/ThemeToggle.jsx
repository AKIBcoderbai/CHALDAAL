import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            className="theme-toggle-container"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className={`toggle-switch ${theme}`}>
                <div className="toggle-handle">
                    {theme === 'light' ? <FaSun className="icon sun" /> : <FaMoon className="icon moon" />}
                </div>
            </div>
        </button>
    );
};

export default ThemeToggle;
