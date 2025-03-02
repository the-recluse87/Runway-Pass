// scripts.js
document.getElementById('accountForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var email = document.getElementById('email').value;
    var confirmEmail = document.getElementById('confirmEmail').value;
    var message = document.getElementById('message');
  
    if (password !== confirmPassword) {
      message.textContent = 'Passwords do not match!';
      message.style.color = 'red';
    } else if (email !== confirmEmail) {
      message.textContent = 'Emails do not match!';
      message.style.color = 'red';
    } else {
      message.textContent = 'Account created successfully!';
      message.style.color = 'green';
      // You can add further code here to process the form data.
    }
  });
  