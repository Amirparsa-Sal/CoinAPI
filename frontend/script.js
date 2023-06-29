const api_base = 'http://127.0.0.1:51986/';

document.addEventListener('DOMContentLoaded', () => {
  const subscriptionFormContainer = document.getElementById('subscriptionFormContainer');
  const historyFormContainer = document.getElementById('historyFormContainer');
  const subscribeToggle = document.getElementById('subscribeToggle');
  const historyToggle = document.getElementById('historyToggle');
  const subscriptionButton = document.getElementById('submitButton');
  const emailInput = document.getElementById('email');
  const coinNameInput = document.getElementById('coinName');
  const differencePercentInput = document.getElementById('differencePercent');
  const coinNameHistoryInput = document.getElementById('coinNameHistory');
  const historyTable = document.getElementById('historyTable').querySelector('tbody');
  const historyButton = document.getElementById('historyButton');
  const paginationContainer = document.getElementById('paginationContainer');

  const itemsPerPage = 10; // Number of items to display per page
  let currentPage = 1; // Current page
  let totalPageCount = 0; // Total number of pages
  let historyData = []; // Array to store the complete history data

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

  subscriptionButton.addEventListener('click', (event) => {
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
    const apiEndpoint = api_base + '/api/subscribe';
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
          emailInput.value = '';
          coinNameInput.value = '';
          differencePercentInput.value = '';
          alert('Subscription successful');
        } else {
          // Subscription failed
          // Handle error case (e.g., display error message)
          displayError(subscriptionFormContainer, 'Subscription failed. Please try again.');
        }
      })
      .catch(error => {
        // Handle error case (e.g., display error message)
        displayError(subscriptionFormContainer, 'An error occurred. Please try again later.');
        console.error(error);
      });
  });

  historyButton.addEventListener('click', () => {
    clearErrors();
    clearHistory();
    resetPagination();

    // Retrieve coin name
    const coinName = coinNameHistoryInput.value.trim();

    // Validate coin name
    if (coinName === '') {
      displayError('Coin name is required');
      return;
    }

    // Make API request to retrieve history
    // Replace `API_URL` with your actual API endpoint
    const apiEndpoint = api_base + `/api/history?coin=${coinName}`;

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
        // Store the complete history data
        historyData = data;

        // Calculate the total number of pages
        totalPageCount = Math.ceil(historyData.length / itemsPerPage);

        // Display the initial page
        displayPage(1);

        // Generate and display pagination links
        generatePaginationLinks();
      })
      .catch(error => {
        // Handle error case (e.g., display error message)
        displayError(historyFormContainer, 'Failed to retrieve history. Please try again.');
        console.error(error);
      });
  });

  // Helper functions

  function isValidEmail(email) {
    // Use regex pattern to validate email format
    const emailPattern = /^\S+@\S+\.\S+$/;
    return emailPattern.test(email);
  }

  function displayError(container, message) {
    const errorElement = document.createElement('p');
    errorElement.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    container.appendChild(errorElement);
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

  function resetPagination() {
    paginationContainer.innerHTML = '';
    currentPage = 1;
    totalPageCount = 0;
    historyData = [];
  }

  function displayPage(pageNumber) {
    // Clear the history table
    clearHistory();

    // Calculate the start and end indices of the items to display
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Get the subset of history data for the current page
    const currentPageData = historyData.slice(startIndex, endIndex);

    // Populate the history table with the retrieved data
    currentPageData.forEach(history => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${history.id}</td>
        <td>${history.coin_name}</td>
        <td>${history.timestamp}</td>
        <td>${history.price}</td>
      `;
      historyTable.appendChild(row);
    });
  }

  function generatePaginationLinks() {
    const paginationLinks = document.createElement('div');
    paginationLinks.classList.add('pagination-links');

    // Generate individual page links
    for (let i = 1; i <= totalPageCount; i++) {
      const pageLink = document.createElement('a');
      pageLink.href = '#';
      pageLink.textContent = i;

      if (i === currentPage) {
        pageLink.classList.add('active');
      }

      pageLink.addEventListener('click', () => {
        currentPage = i;
        displayPage(currentPage);
        updateActivePageLink();
      });

      paginationLinks.appendChild(pageLink);
    }

    paginationContainer.appendChild(paginationLinks);
  }

  function updateActivePageLink() {
    const pageLinks = paginationContainer.querySelectorAll('.pagination-links a');

    pageLinks.forEach(pageLink => {
      pageLink.classList.remove('active');
      if (parseInt(pageLink.textContent) === currentPage) {
        pageLink.classList.add('active');
      }
    });
  }
});
