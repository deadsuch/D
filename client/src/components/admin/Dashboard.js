import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { statsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем права администратора
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    const fetchStats = async () => {
      try {
        const data = await statsAPI.getOverview();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [isAdmin, navigate]);

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Панель управления администратора</h2>
      
      <div className="row mt-4 mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">Пользователей</h5>
              <p className="card-text display-4">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">Мероприятий</h5>
              <p className="card-text display-4">{stats?.totalEvents || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h5 className="card-title">Бронирований</h5>
              <p className="card-text display-4">{stats?.totalBookings || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">Общая выручка</h5>
              <p className="card-text display-4">{stats?.totalRevenue || 0} ₽</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title">Управление мероприятиями</h3>
              <p className="card-text">Создавайте, редактируйте и удаляйте мероприятия.</p>
              <div className="d-flex">
                <Link to="/events" className="btn btn-outline-primary me-2">
                  Все мероприятия
                </Link>
                <Link to="/events/create" className="btn btn-primary">
                  Создать мероприятие
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title">Управление бронированиями</h3>
              <p className="card-text">Просматривайте и управляйте бронированиями пользователей.</p>
              <Link to="/bookings" className="btn btn-primary">
                Все бронирования
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 