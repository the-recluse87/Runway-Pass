document.addEventListener("DOMContentLoaded", async () => {
  const quantities = document.querySelectorAll(".quantity");
  const totalDisplay = document.getElementById("total");
  const prices = [50, 25, 15]; // Day, Plan, Group
  const passNames = ["Day of Travel Pass", "Plan Ahead Pass", "Group Pass"];
  const passTypes = ["day-of-travel", "plan-ahead", "group"];
  let airports = [];

  // Fetch airports from the backend
  const fetchAirports = async () => {
    try {
      const response = await fetch("http://localhost:3000/airports");
      if (response.ok) {
        airports = await response.json();
        airports.sort((a, b) => a.airportCode.localeCompare(b.airportCode));
        console.log("Airports fetched and sorted alphabetically:", airports);
      } else {
        console.error("Failed to fetch airports:", response.statusText);
      }
    } catch (err) {
      console.error("Error fetching airports:", err);
    }
  };

  await fetchAirports();

  // Validate flight confirmation number
  const validateFlightConfirmation = (confirmation) => {
    const regex = /^[A-HJ-NP-Z0-9]{6}$/;
    return regex.test(confirmation);
  };

  // Dynamically update pass fields based on quantity
  const updatePassFields = (passType, quantity, container) => {
    container.innerHTML = "";
    for (let i = 1; i <= quantity; i++) {
      const passField = document.createElement("div");
      passField.classList.add("pass-field");
      passField.style.marginTop = "10px";
      passField.innerHTML = `
        <select id="${passType}-outgoing-airport-${i}" class="airport-dropdown">
          ${airports.map(airport => `<option value="${airport.airportCode}">${airport.airportCode}</option>`).join("")}
        </select>
        <span class="arrow">→</span>
        <select id="${passType}-destination-airport-${i}" class="airport-dropdown">
          ${airports.map(airport => `<option value="${airport.airportCode}">${airport.airportCode}</option>`).join("")}
        </select>
        <label for="${passType}-flight-confirmation-${i}">Flight Confirmation Number:</label>
        <input type="text" id="${passType}-flight-confirmation-${i}" class="flight-confirmation" maxlength="6" required>
        <p class="error-message" id="${passType}-error-${i}" style="color: red; display: none;">Invalid flight confirmation number. Must be 6 uppercase letters/numbers, excluding I and O.</p>
      `;
      container.appendChild(passField);

      // Add validation for the flight confirmation number
      const flightConfirmationInput = passField.querySelector(`#${passType}-flight-confirmation-${i}`);
      const errorMessage = passField.querySelector(`#${passType}-error-${i}`);
      flightConfirmationInput.addEventListener("input", () => {
        if (!validateFlightConfirmation(flightConfirmationInput.value)) {
          errorMessage.style.display = "block";
        } else {
          errorMessage.style.display = "none";
        }
      });
    }
  };

  // Pre-fill from selectpass.js if available
  const stored = localStorage.getItem("passBreakdown");
  if (stored) {
    try {
      const breakdown = JSON.parse(stored);
      passNames.forEach((name, index) => {
        const qty = breakdown[name] || 0;
        quantities[index].value = qty;
        const container = document.getElementById(`${passTypes[index]}-fields`);
        updatePassFields(passTypes[index], qty, container);
      });
    } catch (err) {
      console.warn("Could not parse passBreakdown from localStorage.");
    }
    localStorage.removeItem("passBreakdown");
  }

  // Update total and pass fields when quantities change
  function calculateTotal() {
    let total = 0;
    quantities.forEach((input, index) => {
      const qty = parseInt(input.value) || 0;
      total += qty * prices[index];
      const container = document.getElementById(`${passTypes[index]}-fields`);
      updatePassFields(passTypes[index], qty, container);
    });
    totalDisplay.textContent = total.toFixed(2);
  }

  quantities.forEach(input => {
    input.addEventListener("input", calculateTotal);
  });

  calculateTotal();

  // Proceed to payment: collect all pass data and store in localStorage
  document.querySelector(".checkout-btn").addEventListener("click", async () => {
    let passDetails = [];
    quantities.forEach((input, index) => {
      const qty = parseInt(input.value) || 0;
      for (let i = 1; i <= qty; i++) {
        const dep = document.getElementById(`${passTypes[index]}-outgoing-airport-${i}`)?.value || "";
        const arr = document.getElementById(`${passTypes[index]}-destination-airport-${i}`)?.value || "";
        const conf = document.getElementById(`${passTypes[index]}-flight-confirmation-${i}`)?.value || "";
        passDetails.push({
          type: passNames[index],
          departure: dep,
          arrival: arr,
          confirmation: conf
        });
      }
    });

    // Get user name from backend using token
    let name = "";
    try {
      const token = localStorage.getItem("token");
      const userInfoResponse = await fetch("http://localhost:3000/user-info", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        name = `${userInfo.firstName} ${userInfo.lastName}`;
      } else {
        alert("You must be logged in to purchase passes.");
        console.error("Failed to fetch user info.");
        return;
      }
    } catch (err) {
      alert("You must be logged in to purchase passes.");
      console.error("Error fetching user info:", err);
      return;
    }

    // Debug: Log what will be stored
    console.log("Storing passDetails in localStorage:", { name, passes: passDetails });

    // Defensive: Warn if missing data
    if (!name) {
      alert("You must be logged in to purchase passes.");
      console.error("No user name found from backend.");
      return;
    }
    if (passDetails.length === 0) {
      alert("You must select at least one pass.");
      console.error("No passes selected.");
      return;
    }

    // Store all pass details and name in localStorage
    localStorage.setItem("passDetails", JSON.stringify({ name, passes: passDetails }));

    // Debug: Immediately read back and log what was stored
    const storedPassData = JSON.parse(localStorage.getItem("passDetails") || "{}");
    console.log("passDetails in localStorage right before redirect:", storedPassData);

    // Calculate total and redirect
    let subtotal = 0;
    quantities.forEach((input, index) => {
      const qty = parseInt(input.value) || 0;
      subtotal += qty * prices[index];
    });

    window.location.href = `passpayment.html?total=${subtotal.toFixed(2)}`;
  });
});