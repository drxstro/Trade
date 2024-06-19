document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const staffCheckbox = document.getElementById('isStaff');
  const staffPinContainer = document.getElementById('staff-pin-group');
  const createEventButton = document.getElementById('create-event-button');

  // Toggle staff PIN input based on staff checkbox
  if (staffCheckbox) {
    staffCheckbox.addEventListener('change', () => {
      staffPinContainer.classList.toggle('d-none', !staffCheckbox.checked);
    });
  }

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const username = formData.get('username');
      const password = formData.get('password');
      const isStaff = formData.get('isStaff') === 'on';
      const staffPin = formData.get('staffPin');

      try {
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, isStaff, staffPin }),
        });

        if (response.ok) {
          const { token, isStaff } = await response.json();
          localStorage.setItem('token', token);
          localStorage.setItem('is_staff', isStaff);
          localStorage.setItem('staff_pin', staffPin); // Save staff PIN

          // Redirect to current events page or perform other actions
          window.location.href = '/current-events.html';
        } else {
          const data = await response.json();
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  // Signup form submission
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(signupForm);
      const username = formData.get('username');
      const password = formData.get('password');
      const email = formData.get('email');
      const isStaff = formData.get('isStaff') === 'on';

      try {
        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, email, isStaff }),
        });

        if (response.ok) {
          alert('Signup successful! Please log in.');
          signupForm.reset();
        } else {
          const data = await response.json();
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  // If user is staff and on the correct page, show create event button
  if (localStorage.getItem('is_staff') === 'true' && window.location.pathname.endsWith('/current-events.html')) {
    createEventButton.style.display = 'block';

    createEventButton.addEventListener('click', () => {
      const staffPin = prompt('Enter your staff PIN:');
      if (staffPin === localStorage.getItem('staff_pin')) {
        window.location.href = '/create-event.html';
      } else {
        alert('Invalid staff PIN');
      }
    });
  }

  // If on current-events.html, fetch and display events
  if (window.location.pathname.endsWith('/current-events.html')) {
    const token = localStorage.getItem('token');
    fetchEvents(token);
  }

  async function fetchEvents(token) {
    // Check if token exists in localStorage
    if (!token) {
      console.error('No token found');
      // Handle the case where no token is found, such as redirecting to the login page
      window.location.href = '/login.html';
    } else {
      try {
        const response = await fetch('/api/events', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          displayEvents(data);
        } else {
          const data = await response.json();
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        alert('An error occurred. Please try again.');
      }
    }
  }

  function displayEvents(events) {
    const eventsList = document.getElementById('events-list');
    if (events.length === 0) {
      eventsList.innerHTML = '<p>There are no events right now.</p>';
    } else {
      eventsList.innerHTML = events.map(event => `
        <div class="card my-3">
          <div class="card-body">
            <h5 class="card-title">${event.event_name}</h5>
            <p class="card-text">Start Date: ${new Date(event.start_date).toLocaleDateString()}</p>
            <p class="card-text">End Date: ${new Date(event.end_date).toLocaleDateString()}</p>
            <button class="btn btn-primary" onclick="editEvent(${event.id})">Edit</button>
            <button class="btn btn-danger" onclick="deleteEvent(${event.id})">Delete</button>
          </div>
        </div>
      `).join('');
    }
  }

  async function editEvent(eventId) {
    const staffPin = prompt('Enter your staff PIN:');
    const storedStaffPin = localStorage.getItem('staff_pin');
    if (staffPin !== storedStaffPin) {
      alert('Invalid staff PIN');
      return;
    }

    window.location.href = `/edit-event.html?id=${eventId}`;
  }

  async function deleteEvent(eventId) {
    const staffPin = prompt('Enter your staff PIN:');
    const storedStaffPin = localStorage.getItem('staff_pin');
    if (staffPin !== storedStaffPin) {
      alert('Invalid staff PIN');
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Event deleted successfully!');
        fetchEvents(localStorage.getItem('token')); // Refresh events
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    }
  }

  window.editEvent = editEvent;
  window.deleteEvent = deleteEvent;
});
