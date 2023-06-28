document.addEventListener('DOMContentLoaded', () => {
    const subscriptionFormContainer = document.getElementById('subscriptionFormContainer');
    const historyFormContainer = document.getElementById('historyFormContainer');
    const subscribeToggle = document.getElementById('subscribeToggle');
    const historyToggle = document.getElementById('historyToggle');
    const subscriptionForm = document.getElementById('subscriptionForm');
    const historyForm = document.getElementById('historyForm');
    const emailInput = document.getElementById('email');
    const coinNameInput = document.getElementById('coinName');
    const differencePercentInput = document.getElementById('differencePercent');
    const coinNameHistoryInput = document.getElementById('coinNameHistory');
    const historyTable = document.getElementById('historyTable').querySelector('tbody');
    const historyButton = document.getElementById('historyButton');
    
    subscribeToggle.classList.add('active');
    historyToggle.classList.remove('active');

    subscribeToggle.addEventListener('click', () => {
        subscriptionFormContainer.style.display = 'block';
        historyFormContainer.style.display = 'none';
        subscribeToggle.classList.add('active');
        historyToggle.classList.remove('active');
      });
    
      historyToggle.addEventListener('click', () => {
        subscriptionFormContainer.style.display = 'none';
        historyFormContainer.style.display = 'block';
        subscribeToggle.classList.remove('active');
        historyToggle.classList.add('active');
      });
  
    subscriptionForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors();
  
      // Retrieve input values
      const email = emailInput.value.trim();
      const coinName = coinNameInput.value.trim();
      const differencePercent = parseInt(differencePercentInput.value);
  
      // Validate input values
      if (!isValidEmail(email)) {
        displayError('Invalid email address');
        return;
      }
  
      if (coinName === '') {
        displayError('Coin name is required');
        return;
      }
  
      if (isNaN(differencePercent) || differencePercent < 0 || differencePercent > 100) {
        displayError('Difference percent must be a number between 0 and 100');
        return;
      }
  
      // Make API request to subscribe
      // Replace `API_URL` with your actual API endpoint
      const apiEndpoint = 'http://localhost:5001/api/subscribe';
      const requestData = {
        email: email,
        coin_name: coinName,
        difference_percent: differencePercent
      };
  
      // Send the request using your preferred method (e.g., fetch, Axios, etc.)
      // Example using fetch:
      fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
        .then(response => {
          if (response.ok) {
            // Subscription successful
            // Handle success case (e.g., show success message, clear form, etc.)
            subscriptionForm.reset();
            alert('Subscription successful');
          } else {
            // Subscription failed
            // Handle error case (e.g., display error message)
            displayError('Subscription failed. Please try again.');
          }
        })
        .catch(error => {
          // Handle error case (e.g., display error message)
          displayError('An error occurred. Please try again later.');
          console.error(error);
        });
    });
  
    historyButton.addEventListener('click', () => {
      clearHistory();
  
      // Retrieve coin name
      const coinName = coinNameHistoryInput.value.trim();
  
      // Validate coin name
      if (coinName === '') {
        displayError('Coin name is required');
        return;
      }
  
      // Make API request to retrieve history
      // Replace `API_URL` with your actual API endpoint
      const apiEndpoint = `http://localhost:5001/api/history?coin=${coinName}`;
  
      // Send the request using your preferred method (e.g., fetch, Axios, etc.)
      // Example using fetch:
      fetch(apiEndpoint)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Request failed');
          }
        })
        .then(data => {
          // Handle successful response
          // Populate the history table with the retrieved data
          data.forEach(history => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${history.id}</td>
              <td>${history.coin_name}</td>
              <td>${history.timestamp}</td>
              <td>${history.price}</td>
            `;
            historyTable.appendChild(row);
          });
        })
        .catch(error => {
          // Handle error case (e.g., display error message)
          displayError('Failed to retrieve history. Please try again.');
          console.error(error);
        });
    });
  
    // Helper functions
  
    function isValidEmail(email) {
      // Use regex pattern to validate email format
      const emailPattern = /^\S+@\S+\.\S+$/;
      return emailPattern.test(email);
    }
  
    function displayError(message) {
      const errorElement = document.createElement('p');
      errorElement.classList.add('error');
      errorElement.textContent = message;
      subscriptionFormContainer.appendChild(errorElement);
    }
  
    function clearErrors() {
      const errorElements = subscriptionFormContainer.querySelectorAll('.error');
      errorElements.forEach(element => element.remove());
    }
  
    function clearHistory() {
      while (historyTable.firstChild) {
        historyTable.firstChild.remove();
      }
    }
  });
  