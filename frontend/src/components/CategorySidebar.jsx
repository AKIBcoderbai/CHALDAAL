import React from 'react';
import './CategorySidebar.css';

const categories = [
  { id: 1, name: 'Grocery', icon: '🍎' },
  { id: 2, name: 'Beverage', icon: '🥤' },
  { id: 3, name: 'Pharmacy', icon: '💊' },
  { id: 7, name: 'Clothing', icon: '👕' },     
  { id: 8, name: 'Electronics', icon: '💻' } 
];

const CategorySidebar = ({ activeCategory, onSelectCategory, isOpen, onClose }) => {

 
  return (

    <>

    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>

    </div>
    <aside className={`category-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="menu-list">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className={`menu-item ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => {
                onSelectCategory(cat.name);
                onClose(); 
              }}
            >
              <span className="icon">{cat.icon}</span>
              <span className="label">{cat.name}</span>
              <span className="arrow">›</span>
            </div>
          ))}
        </div>
        
        <div className="sidebar-footer">
          <p>📞 16710</p>
          <p>Help & Support</p>
        </div>
      </aside>
    </>
  );
};

export default CategorySidebar;