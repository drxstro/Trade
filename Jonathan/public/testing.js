const token = localStorage.getItem('token');

// Check if token exists and is valid
if (!token) {
  console.error('No token found');
  // Handle the case where no token is found, such as redirecting to the login page
  // For example:
  // window.location.href = '/login.html';
} else {
  // Make the fetch request with the Authorization header
  fetch('http://localhost:3000/api/events', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return response.json();
  })
  .then(data => {
    // Handle the data received from the server
    console.log(data);
  })
  .catch(error => {
    console.error('Error fetching events:', error);
    // Handle the error, such as displaying an error message to the user
  });
}
