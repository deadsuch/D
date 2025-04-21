import React from 'react';

const ChatsList = () => {
  return (
    <div className="container py-5">
      <h2>Чаты с организаторами</h2>
      
      <div className="alert alert-info mt-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-chat-dots me-3 display-5"></i>
          <div>
            <h5>Чаты находятся в разработке</h5>
            <p className="mb-0">Функция чатов с организаторами мероприятий будет доступна в ближайшее время.</p>
          </div>
        </div>
      </div>
      
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-transparent border-0">
          <h5 className="mb-0">Возможности чатов</h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-question-circle text-primary fs-4 me-3"></i>
                <h6 className="mb-0">Задавайте вопросы</h6>
              </div>
              <p className="text-muted small ps-5">Получайте ответы на все вопросы о мероприятии напрямую от организаторов</p>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-info-circle text-primary fs-4 me-3"></i>
                <h6 className="mb-0">Получайте информацию</h6>
              </div>
              <p className="text-muted small ps-5">Узнавайте актуальные детали и изменения в программе мероприятия</p>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-person-check text-primary fs-4 me-3"></i>
                <h6 className="mb-0">Обратная связь</h6>
              </div>
              <p className="text-muted small ps-5">Делитесь своими впечатлениями и пожеланиями с организаторами</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsList; 