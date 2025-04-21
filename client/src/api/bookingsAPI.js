const getById = async (id) => {
  const response = await fetch(`${API_URL}/bookings/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ошибка при получении информации о бронировании');
  }
  
  return await response.json();
};

const sendTicketByEmail = async (bookingId) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/send-ticket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Ошибка при отправке билета');
  }
  
  return await response.json();
};

export default {
  // ... existing code ...
  getById,
  sendTicketByEmail,
  // ... existing code ...
}; 