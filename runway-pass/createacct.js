document.getElementById('accountForm').addEventListener('submit', async function (event) 
{
  event.preventDefault();

  const message = document.getElementById('message');

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const email = document.getElementById('email').value;
  const confirmEmail = document.getElementById('confirmEmail').value;

  if (password !== confirmPassword) 
  {
    message.textContent = 'Passwords do not match!';
    message.style.color = 'red';
    return;
  }

  if (email !== confirmEmail) 
  {
    message.textContent = 'Emails do not match!';
    message.style.color = 'red';
    return;
  }

  const data = 
  {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    dobDay: parseInt(document.getElementById('dobDay').value),
    dobMonth: parseInt(document.getElementById('dobMonth').value),
    dobYear: parseInt(document.getElementById('dobYear').value),
    gender: document.getElementById('gender').value,
    country: document.getElementById('country').value,
    address1: document.getElementById('address1').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zip: document.getElementById('zip').value,
    phone: document.getElementById('phone').value,
    email: email,
    username: document.getElementById('username').value,
    password: password,
    securityQuestion1: document.getElementById('securityQuestion1').value,
    answer1: document.getElementById('answer1').value,
    securityQuestion2: document.getElementById('securityQuestion2').value,
    answer2: document.getElementById('answer2').value
  };

  try 
  {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) 
    {
      window.location.href = "index.html";
    } 
    else 
    {
      const error = await res.text();
      message.textContent = `Error: ${error}`;
      message.style.color = 'red';
    }
  } 
  catch (err) 
  {
    message.textContent = 'Server error';
    message.style.color = 'red';
  }
});
