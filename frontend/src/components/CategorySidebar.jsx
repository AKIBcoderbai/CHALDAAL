import React from 'react';
import './CategorySidebar.css';

const categories = [
  { id: 1, name: 'Grocery', icon: '🥚' },
  { id: 2, name: 'Beverage', icon: '🥤' },
  { id: 3, name: 'Pharmacy', icon: '💊' },
  {
    id: 4, name: 'Clothes', icon: '👕'
  },
  { id: 5, name: 'Electronics', icon: '📱' }
];

// Note: We removed the extra search props. We only need 'onSelectCategory'
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
                onClose(); // Close sidebar when an item is clicked (UX best practice)
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