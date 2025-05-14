document.addEventListener("DOMContentLoaded", async () => 
{
    const subtotalEl = document.getElementById("subtotalDisplay");
    const taxEl = document.getElementById("taxDisplay");
    const totalEl = document.getElementById("totalDisplay");
    const breakdownEl = document.getElementById("itemBreakdown");

    const params = new URLSearchParams(window.location.search);
    const breakdownParam = params.get("breakdown");
    const totalParam = parseFloat(params.get("total")) || 0;

    let breakdown;
    try 
    {
      breakdown = breakdownParam ? JSON.parse(decodeURIComponent(breakdownParam)) : {};
    } 
    catch (e) 
    {
      breakdown = {};
    }

    let subtotal = 0;
    breakdownEl.innerHTML = ""; // Clear in case of reload

    for (const [item, qty] of Object.entries(breakdown)) 
    {
      if (qty > 0) 
      {
        let price = 0;
        if (item.includes("Day of Travel")) price = 50;
        else if (item.includes("Plan Ahead")) price = 25;
        else if (item.includes("Group Pass")) price = 15;

        const line = document.createElement("p");
        line.textContent = `${qty}× ${item} - $${(qty * price).toFixed(2)}`;
        breakdownEl.appendChild(line);
        subtotal += qty * price;
      }
    }

    const tax = subtotal * 0.045;
    const total = subtotal + tax;

    subtotalEl.textContent = subtotal.toFixed(2);
    taxEl.textContent = tax.toFixed(2);
    totalEl.textContent = total.toFixed(2);

    const token = localStorage.getItem("token");
    let email = "";
    let firstName = "";
    let lastName = "";

    try {
      const userInfoResponse = await fetch("http://localhost:3000/user-info", {
          method: "GET",
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });

      if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          email = userInfo.email;
          firstName = userInfo.firstName;
          lastName = userInfo.lastName;
          console.log("User info retrieved:", userInfo);
      } else {
          console.error("Failed to fetch user info:", userInfoResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }

    function validateCardNumber(cardNumber) 
    {
      const digits = cardNumber.replace(/\D/g, '').split('').reverse();
      const checksum = digits.reduce((sum, digit, index) => 
      {
          let num = parseInt(digit, 10);
          if (index % 2 === 1) 
          {
              num *= 2;
              if (num > 9) num -= 9;
          }
          return sum + num;
      }, 0);
      return checksum % 10 === 0;
    }

    function validateCardholderName(name)
    {
      return /^[a-zA-Z]+\s[a-zA-Z]+$/.test(name);
    }

    function validateExpirationDate(expDate)
    {
      return /^\d{1,2}\/\d{2}$/.test(expDate);
    }

    function validateCVV(cvv)
    {
      return /^\d{3}$/.test(cvv);
    }

    document.getElementById("paymentForm").addEventListener("submit", async function (e) 
    {
      e.preventDefault();

      const cardNumber = document.getElementById("cardNumber").value;
      const cardName = document.getElementById("cardName").value;
      const expDate = document.getElementById("expDate").value;
      const cvv = document.getElementById("cvv").value;
      const errorMessageEl = document.getElementById("errorMessage");

      if(!validateCardNumber(cardNumber)) 
      {
        errorMessageEl.textContent = "Invalid card number. Please check and try again.";
        errorMessageEl.style.display = "block";
        return;
      }

      if(!validateCardholderName(cardName))
      {
        errorMessageEl.textContent = "Invalid cardholder name. Please enter a first and last name.";
        errorMessageEl.style.display = "block";
        return;
      }

      if(!validateExpirationDate(expDate))
      {
        errorMessageEl.textContent = "Invalid expiration date. Ensure that the card has not expired.";
        errorMessageEl.style.display = "block";
        return;
      }

      if(!validateCVV(cvv))
      {
        errorMessageEl.textContent = "Invalid CVV. Please enter a 3-digit number.";
        errorMessageEl.style.display = "block";
        return;
      }

      errorMessageEl.style.display = "none";

      document.getElementById("confirmationMessage").style.display = "block";

      // --- Send all pass data to backend to generate passes ---
      const passData = JSON.parse(localStorage.getItem("passDetails") || "{}");
      passData.name = `${firstName} ${lastName}`;
      let generatedPasses = [];
      try {
        const genResponse = await fetch("http://localhost:3000/generate-pass", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passData),
        });
        if (genResponse.ok) {
          const genData = await genResponse.json();
          console.log("generate-pass response:", genData); // DEBUG
          generatedPasses = genData.passes || [];
          console.log("generatedPasses array:", generatedPasses); // DEBUG
        } else {
          const errorText = await genResponse.text();
          console.error("Failed to generate passes:", genResponse.statusText, errorText); // DEBUG
        }
      } catch (error) {
        console.error("Failed to generate pass:", error);
      }

      // --- Send confirmation email with only the new passes ---
      try {
        // DEBUG: Log what is being sent to the backend
        console.log("Sending passes to confirmation email:", generatedPasses);

        const response = await fetch("http://localhost:3000/send-confirmation-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            // Ensure plain objects are sent
            body: JSON.stringify({ passes: generatedPasses.map(p => ({
              runwayPassID: p.runwayPassID,
              departure: p.departure,
              arrival: p.arrival,
              date: p.date,
              flightID: p.flightID
            })) }),
        });
    
        if (response.ok) {
            const data = await response.json();
            console.log("Confirmation email sent:", data);
        } else {
            const errorText = await response.text();
            console.error("Failed to send confirmation email:", response.statusText, errorText);
        }
      } catch (error) {
        console.error("Failed to send confirmation email:", error);
      }

      //setTimeout(() => {
      //  window.location.href = "paymentconfirmation.html";
      //}, 2000);
    });  
});