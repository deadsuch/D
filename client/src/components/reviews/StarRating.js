import React from 'react';

const StarRating = ({ rating, size = 'md', interactive = false, onRatingChange = null }) => {
  // Максимальное количество звезд
  const maxStars = 5;
  
  // Определение размера звезд
  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'fs-6';
      case 'lg': return 'fs-4';
      case 'xl': return 'fs-3';
      default: return 'fs-5';
    }
  };
  
  // Округляем рейтинг до половины звезды
  const roundedRating = Math.round(rating * 2) / 2;
  
  // Обработчик клика по звезде
  const handleStarClick = (selectedRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  // Обработчик наведения на звезду
  const handleStarHover = (selectedRating) => {
    if (interactive && onRatingChange) {
      // Здесь можно добавить логику предпросмотра выбранного рейтинга
    }
  };
  
  return (
    <div className="star-rating">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        
        // Определяем класс иконки в зависимости от рейтинга
        let iconClass = 'bi-star text-muted';
        
        if (roundedRating >= starValue) {
          iconClass = 'bi-star-fill text-warning';
        } else if (roundedRating >= starValue - 0.5) {
          iconClass = 'bi-star-half text-warning';
        }
        
        return (
          <span 
            key={index}
            className={`${getStarSize()} ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            role={interactive ? 'button' : undefined}
            style={{ marginRight: '2px' }}
          >
            <i className={`bi ${iconClass}`}></i>
          </span>
        );
      })}
    </div>
  );
};

export default StarRating; 