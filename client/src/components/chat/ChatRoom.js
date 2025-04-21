import React from 'react';
import { Link, useParams } from 'react-router-dom';

const ChatRoom = () => {
  const { id } = useParams();
  
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Чат с организатором</h2>
        <Link to="/chats" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Назад к списку чатов
        </Link>
      </div>
      
      <div className="alert alert-info mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-chat-dots me-3 fs-3"></i>
          <div>
            <h5 className="mb-1">Чат #{id} в разработке</h5>
            <p className="mb-0">Функция чатов с организаторами мероприятий будет доступна в ближайшее время.</p>
          </div>
        </div>
      </div>
      
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light py-3">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                 style={{ width: "40px", height: "40px", fontSize: "18px" }}>
              <i className="bi bi-person"></i>
            </div>
            <div>
              <h6 className="mb-0">Организатор мероприятия</h6>
              <small className="text-muted">В сети 3 часа назад</small>
            </div>
          </div>
        </div>
        
        <div className="card-body p-4" style={{ height: "400px", overflowY: "auto" }}>
          <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
            <i className="bi bi-chat-square-text display-1 mb-3 text-light"></i>
            <p>Здесь будут отображаться сообщения чата</p>
          </div>
        </div>
        
        <div className="card-footer bg-white p-3">
          <div className="input-group">
            <input type="text" className="form-control" placeholder="Введите сообщение..." disabled />
            <button className="btn btn-primary" type="button" disabled>
              <i className="bi bi-send me-1"></i>
              Отправить
            </button>
          </div>
          <small className="text-muted mt-2 d-block">Функция чата будет доступна после полного запуска системы</small>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom; 