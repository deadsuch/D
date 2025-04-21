import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Контекст аутентификации
import { AuthProvider } from './context/AuthContext';

// Компоненты макета
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Компоненты страниц
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EventsList from './components/events/EventsList';
import EventDetail from './components/events/EventDetail';
import EventForm from './components/events/EventForm';
import BookingsList from './components/bookings/BookingsList';
import Profile from './components/users/Profile';
import Dashboard from './components/admin/Dashboard';
import BookingEditForm from './components/bookings/BookingEditForm';

// Новые компоненты для дополнительных функций
import ReviewsList from './components/reviews/ReviewsList';
import ReviewForm from './components/reviews/ReviewForm';
import EventCalendar from './components/events/EventCalendar';
import TicketView from './components/bookings/TicketView';
import LoyaltyDashboard from './components/users/LoyaltyDashboard';
import ChatsList from './components/chat/ChatsList';
import ChatRoom from './components/chat/ChatRoom';
import EventLocation from './components/events/EventLocation';

// Маршруты
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/calendar" element={<EventCalendar />} />
              
              {/* Маршруты для отзывов */}
              <Route path="/events/:id/reviews" element={<ReviewsList />} />
              <Route path="/events/:id/reviews/new" element={
                <PrivateRoute>
                  <ReviewForm />
                </PrivateRoute>
              } />
              <Route path="/reviews/:id/edit" element={
                <PrivateRoute>
                  <ReviewForm />
                </PrivateRoute>
              } />
              
              {/* Маршруты для геолокации */}
              <Route path="/events/:id/location" element={<EventLocation />} />
              
              {/* Защищенные маршруты для авторизованных пользователей */}
              <Route path="/bookings" element={
                <PrivateRoute>
                  <BookingsList />
                </PrivateRoute>
              } />
              <Route path="/bookings/:id/ticket" element={
                <PrivateRoute>
                  <TicketView />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              <Route path="/loyalty" element={
                <PrivateRoute>
                  <LoyaltyDashboard />
                </PrivateRoute>
              } />
              <Route path="/chats" element={
                <PrivateRoute>
                  <ChatsList />
                </PrivateRoute>
              } />
              <Route path="/chats/:id" element={
                <PrivateRoute>
                  <ChatRoom />
                </PrivateRoute>
              } />
              
              {/* Защищенные маршруты только для администраторов */}
              <Route path="/admin" element={
                <PrivateRoute adminOnly={true}>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/events/create" element={
                <AdminRoute>
                  <EventForm />
                </AdminRoute>
              } />
              <Route path="/events/edit/:id" element={
                <AdminRoute>
                  <EventForm />
                </AdminRoute>
              } />
              <Route path="/bookings/:id/edit" element={
                <AdminRoute>
                  <BookingEditForm />
                </AdminRoute>
              } />
              
              {/* Маршрут для страниц не найдено */}
              <Route path="*" element={
                <div className="text-center py-5">
                  <h2>404 - Страница не найдена</h2>
                  <p>Запрашиваемая страница не существует.</p>
                  <Link to="/" className="btn btn-primary mt-3">Вернуться на главную</Link>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
