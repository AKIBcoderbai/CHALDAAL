import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
//import './ThemeToggle.css'; // We will add styles next

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="theme-toggle-container" onClick={toggleTheme}>
            <div className={`toggle-switch ${theme}`}>
                <div className="toggle-handle">
                    {theme === 'light' ? <FaSun className="icon sun" /> : <FaMoon className="icon moon" />}
                </div>
            </div>
        </div>
    );
};

export default ThemeToggle;