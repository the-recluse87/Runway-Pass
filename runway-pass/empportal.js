document.getElementById('empportal-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const firstName = document.getElementById('empportal-firstName').value.trim();
  const lastName = document.getElementById('empportal-lastName').value.trim();
  // Use the raw value, do not convert!
  const date = document.getElementById('empportal-dob').value;
  const runwayPassID = document.getElementById('empportal-flightnumber').value.trim();

  const resultDiv = document.getElementById('empportal-result');
  resultDiv.textContent = "Checking...";
  console.log('Submitting values:', {
    userFirst: firstName,
    userLast: lastName,
    date: date,
    runwayPassID: runwayPassID
  });

  try {
    const response = await fetch('/verify-pass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userFirst: firstName, userLast: lastName, date, runwayPassID })
    });

    const data = await response.json();
    if (response.ok && data.found) {
      resultDiv.innerHTML = `<span class="empportal-pass">Runway Pass Verified</span>`;
    } else {
      resultDiv.innerHTML = `<span class="empportal-no-pass">No matching Runway Pass ❌</span>`;
    }
  } catch (err) {
    resultDiv.innerHTML = `<span class="empportal-no-pass">Error checking pass.</span>`;
  }
});