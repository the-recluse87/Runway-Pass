(() => {
  // Private data for employee portal (example)
  const empportalPassengers = [
    {
      firstName: 'Alice',
      lastName: 'Smith',
      dob: '1990-01-15',
      idNumber: '123',
      ticketNumber: 'TCK12345',
      hasPass: true,
    },
    {
      firstName: 'Bob',
      lastName: 'Johnson',
      dob: '1985-05-22',
      idNumber: '456',
      ticketNumber: 'TCK67890',
      hasPass: false,
    },
  ];

  function checkPass(event) {
    event.preventDefault();

    const firstName = document.getElementById('empportal-firstName').value.trim().toLowerCase();
    const lastName = document.getElementById('empportal-lastName').value.trim().toLowerCase();
    const dob = document.getElementById('empportal-dob').value;
    const idNumber = document.getElementById('empportal-idNumber').value.trim();
    const ticketNumber = document.getElementById('empportal-ticketNumber').value.trim().toUpperCase();

    const resultDiv = document.getElementById('empportal-result');

    const match = empportalPassengers.find(p =>
      p.firstName.toLowerCase() === firstName &&
      p.lastName.toLowerCase() === lastName &&
      p.dob === dob &&
      p.idNumber === idNumber &&
      p.ticketNumber === ticketNumber
    );

    if (match) {
      resultDiv.innerHTML = `${match.firstName} ${match.lastName} — 
        <span class="${match.hasPass ? 'empportal-pass' : 'empportal-no-pass'}">
          ${match.hasPass ? 'Has Runway Pass ✅' : 'No Runway Pass ❌'}
        </span>`;
      resultDiv.className = 'empportal-result';
    } else {
      resultDiv.textContent = 'Passenger not found or information mismatch.';
      resultDiv.className = 'empportal-result empportal-no-pass';
    }
  }

  document.getElementById('empportal-form').addEventListener('submit', checkPass);
})();
