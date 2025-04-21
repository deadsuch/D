import React from 'react';
import { Link, useParams } from 'react-router-dom';

const EventLocation = () => {
  const { id } = useParams();
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Местоположение мероприятия</h2>
        <Link to={`/events/${id}`} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Назад к мероприятию
        </Link>
      </div>
      
      <div className="alert alert-info mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-geo-alt me-3 fs-3"></i>
          <div>
            <h5 className="mb-1">Карта в разработке</h5>
            <p className="mb-0">Функция отображения местоположения мероприятия на карте будет доступна в ближайшее время.</p>
          </div>
        </div>
      </div>
      
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="bg-light text-center py-5" style={{ height: "400px" }}>
            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
              <i className="bi bi-map display-1 mb-3 text-secondary"></i>
              <h5>Здесь будет отображаться карта</h5>
              <p className="text-muted mb-4">Местоположение мероприятия #{id}</p>
              
              <div className="mt-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <i className="bi bi-geo-alt me-2 text-danger"></i>
                  <span>Музей современного искусства</span>
                </div>
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-info-circle me-2"></i>
                  <span>Кузнецкий мост, 11, Москва</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-transparent">
          <h5 className="mb-0">Как добраться</h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-train-front text-primary me-2"></i>
                <h6 className="mb-0">На метро</h6>
              </div>
              <p className="text-muted small ms-4">Станция метро "Кузнецкий мост", выход в сторону ул. Кузнецкий мост, 5 минут пешком</p>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-bus-front text-primary me-2"></i>
                <h6 className="mb-0">На автобусе</h6>
              </div>
              <p className="text-muted small ms-4">Автобусы №№ 38, 101, 144 до остановки "Кузнецкий мост"</p>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-car-front text-primary me-2"></i>
                <h6 className="mb-0">На автомобиле</h6>
              </div>
              <p className="text-muted small ms-4">Платная парковка вдоль улицы и в прилегающих переулках</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventLocation; 