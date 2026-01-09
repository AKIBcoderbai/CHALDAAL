import React from 'react';
import './BannerCarousel.css';

const banners = [
  { 
    id: 1, 
    title: "Mortein Offer",
    img: "https://i.chaldn.com/_mpimage?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D171994&q=low&v=1&m=600&webp=1", 
    // Red Gradient for Mortein
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #ff5252 100%)"
  },
  { 
    id: 2, 
    title: "Savlon Hygiene",
    img: "https://i.chaldn.com/_mpimage?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D174321&q=low&v=1&m=600&webp=1", 
    // Blue Gradient for Medical/Hygiene
    gradient: "linear-gradient(135deg, #a1c4fd 0%, #1976d2 100%)"
  },
  { 
    id: 3, 
    title: "Tata Tea",
    img: "https://i.chaldn.com/_mpimage?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D185053&q=low&v=1&m=600&webp=1", 
    // Green Gradient for Tea/Nature
    gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
  },
  { 
    id: 4, 
    title: "bKash Cashback",
    img: "https://i.chaldn.com/_mpimage?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D185192&q=low&v=1&m=600&webp=1", 
    // Pink Gradient for bKash
    gradient: "linear-gradient(135deg, #fbc2eb 0%, #e91e63 100%)"
  },
  { 
    id: 5, 
    title: "App",
    img: "https://i.chaldn.com/_mpimage?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D169124&q=low&v=1&m=600&webp=1", 
    // Orange Gradient for Cooking
    gradient: "linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)"
  }
];

const BannerCarousel = () => {
  return (
    <div className="banner-carousel-container">
      {banners.map((banner) => (
        <div 
          key={banner.id} 
          className="banner-item"
          style={{ background: banner.gradient }} // Use the gradient here
        >
          <img src={banner.img} alt={banner.title} className="banner-image" />
          
          <div className="banner-content">
            <div className="banner-title">{banner.title}</div>
            <div className="banner-shop-now">Shop Now</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerCarousel;