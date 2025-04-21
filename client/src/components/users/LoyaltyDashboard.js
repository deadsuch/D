import React from 'react';
import { useAuth } from '../../context/AuthContext';

const LoyaltyDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container py-5">
      <h2>Программа лояльности</h2>
      
      <div className="card mt-4 border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Здравствуйте, {currentUser?.name || 'Гость'}!</h5>
          <div className="d-flex align-items-center my-4">
            <div className="display-4 me-3 text-primary fw-bold">0</div>
            <div>
              <h6 className="mb-0">Бонусных баллов</h6>
              <small className="text-muted">Накапливайте баллы и обменивайте их на скидки</small>
            </div>
          </div>
          
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Система лояльности находится в разработке и будет запущена в ближайшее время!
          </div>
        </div>
      </div>
      
      <div className="card mt-4 border-0 shadow-sm">
        <div className="card-header bg-transparent border-0">
          <h5 className="mb-0">Как это работает</h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center mb-3">
                <i className="bi bi-ticket-perforated text-primary display-5"></i>
              </div>
              <h6 className="text-center">Бронируйте мероприятия</h6>
              <p className="text-muted small text-center">Получайте 10% от стоимости билета в виде бонусных баллов</p>
            </div>
            <div className="col-md-4">
              <div className="text-center mb-3">
                <i className="bi bi-star text-primary display-5"></i>
              </div>
              <h6 className="text-center">Оставляйте отзывы</h6>
              <p className="text-muted small text-center">Дополнительные 50 баллов за каждый отзыв о посещенном мероприятии</p>
            </div>
            <div className="col-md-4">
              <div className="text-center mb-3">
                <i className="bi bi-gift text-primary display-5"></i>
              </div>
              <h6 className="text-center">Получайте скидки</h6>
              <p className="text-muted small text-center">Используйте накопленные баллы для скидки на следующее бронирование</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard; 