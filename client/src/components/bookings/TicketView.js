import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI, eventsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TicketView = () => {
  const { id: bookingId } = useParams();
  const { currentUser } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrValue, setQrValue] = useState('');
  
  const ticketRef = useRef(null);
  
  // Загрузка данных о бронировании и мероприятии
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Получаем информацию о бронировании
        const bookingData = await bookingsAPI.getById(bookingId);
        setBooking(bookingData);
        
        // Получаем информацию о мероприятии
        const eventData = await eventsAPI.getById(bookingData.event_id);
        setEvent(eventData);
        
        // Создаем значение для QR-кода
        setQrValue(JSON.stringify({
          booking_id: bookingData.id,
          event_id: bookingData.event_id,
          user_id: bookingData.user_id,
          tickets_count: bookingData.tickets_count,
          verification: btoa(`${bookingData.id}-${bookingData.user_id}-${bookingData.event_id}`)
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [bookingId]);
  
  // Форматирование даты
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };
  
  // Генерация номера билета
  const generateTicketNumber = (bookingId, userId) => {
    return `EB-${bookingId.toString().padStart(6, '0')}-${userId.toString().padStart(4, '0')}`;
  };
  
  // Скачивание билета в PDF
  const downloadTicketPDF = async () => {
    if (!ticketRef.current) return;
    
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // Увеличиваем качество
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Добавляем изображение в PDF
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ticket_${booking.id}.pdf`);
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      alert('Произошла ошибка при создании PDF. Пожалуйста, попробуйте еще раз.');
    }
  };
  
  // Отправка билета на email
  const sendTicketByEmail = async () => {
    try {
      await bookingsAPI.sendTicketByEmail(bookingId);
      alert('Билет успешно отправлен на вашу электронную почту');
    } catch (error) {
      alert(`Ошибка при отправке билета: ${error.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Ошибка!</h4>
          <p>{error}</p>
          <Link to="/bookings" className="btn btn-primary mt-3">Вернуться к списку бронирований</Link>
        </div>
      </div>
    );
  }
  
  if (!booking || !event) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4>Билет не найден</h4>
          <p>Запрашиваемый билет не существует или был удален.</p>
          <Link to="/bookings" className="btn btn-primary mt-3">Вернуться к списку бронирований</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Электронный билет</h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary" 
            onClick={downloadTicketPDF}
          >
            <i className="bi bi-download me-2"></i>
            Скачать PDF
          </button>
          <button 
            className="btn btn-outline-primary" 
            onClick={sendTicketByEmail}
          >
            <i className="bi bi-envelope me-2"></i>
            Отправить на email
          </button>
          <Link to="/bookings" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Назад
          </Link>
        </div>
      </div>
      
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          {/* Билет */}
          <div 
            ref={ticketRef} 
            className="card border-0 shadow position-relative overflow-hidden"
            style={{ backgroundColor: '#fff', maxWidth: '800px', margin: '0 auto' }}
          >
            {/* Заголовок билета */}
            <div className="position-relative" style={{ backgroundColor: '#4e73df', padding: '2rem' }}>
              <div className="text-white">
                <h3 className="mb-0 fw-bold">EventBooking</h3>
                <p className="mb-0">Электронный билет на мероприятие</p>
              </div>
              <div 
                className="position-absolute" 
                style={{ 
                  top: 0, 
                  right: 0, 
                  bottom: 0, 
                  width: '150px', 
                  background: 'radial-gradient(circle at right, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)' 
                }}
              ></div>
            </div>
            
            {/* Информация о билете */}
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-8">
                  <h4 className="fw-bold text-truncate mb-4">{event.title}</h4>
                  
                  <div className="row mb-4">
                    <div className="col-sm-6 mb-3">
                      <label className="text-muted mb-1 small">Номер билета</label>
                      <p className="fw-bold mb-0">{generateTicketNumber(booking.id, currentUser.id)}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <label className="text-muted mb-1 small">Дата бронирования</label>
                      <p className="mb-0">{formatDate(booking.booking_date)}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <label className="text-muted mb-1 small">Дата и время мероприятия</label>
                      <p className="mb-0">{formatDate(event.date_time)}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <label className="text-muted mb-1 small">Место проведения</label>
                      <p className="mb-0">{event.location}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <label className="text-muted mb-1 small">Количество билетов</label>
                      <p className="mb-0">{booking.tickets_count}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <label className="text-muted mb-1 small">Стоимость</label>
                      <p className="mb-0">{booking.total_price} ₽</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 pb-2">
                    <label className="text-muted mb-1 small">Посетитель</label>
                    <p className="mb-0 fw-bold">{currentUser.name}</p>
                    <p className="mb-0">{currentUser.email}</p>
                  </div>
                  
                  <div className="alert alert-warning small p-2">
                    <i className="bi bi-info-circle me-2"></i>
                    Для прохода на мероприятие предъявите этот электронный билет или его распечатанную версию.
                  </div>
                </div>
                
                <div className="col-md-4 text-center">
                  <div className="d-flex flex-column align-items-center h-100 justify-content-center">
                    <div className="bg-white p-2 shadow-sm rounded mb-3">
                      <QRCodeCanvas 
                        value={qrValue}
                        size={150}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="small text-muted">ID: {booking.id}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Нижний колонтитул билета */}
            <div className="card-footer bg-light py-3 text-center">
              <p className="small text-muted mb-0">
                EventBooking &copy; {new Date().getFullYear()} | 
                Информация действительна на {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>
            
            {/* Декоративные элементы */}
            <div 
              className="position-absolute" 
              style={{ 
                top: '50%', 
                left: '-10px', 
                transform: 'translateY(-50%)',
                width: '20px',
                height: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '0 20px 20px 0'
              }}
            ></div>
            <div 
              className="position-absolute" 
              style={{ 
                top: '50%', 
                right: '-10px', 
                transform: 'translateY(-50%)',
                width: '20px',
                height: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '20px 0 0 20px'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketView; 