// scripts.js
// login
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

  // cart
  document.addEventListener("DOMContentLoaded", function () {
    const cartItems = document.querySelectorAll('.cart-item');
    const totalDisplay = document.getElementById('total');
  
    function updateCartTotal() {
      let total = 0;
  
      cartItems.forEach(item => {
        const price = parseFloat(item.dataset.price);
        const quantityInput = item.querySelector('.quantity');
        const quantity = parseInt(quantityInput.value);
        const subtotalElement = item.querySelector('.subtotal');
  
        const subtotal = price * quantity;
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  
        total += subtotal;
      });
  
      totalDisplay.textContent = total.toFixed(2);
    }
  
    // Add event listeners to all quantity inputs
    cartItems.forEach(item => {
      const input = item.querySelector('.quantity');
      input.addEventListener('input', updateCartTotal);
    });
  
    // Initial update
    updateCartTotal();
  });
  
  