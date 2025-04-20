document.addEventListener("DOMContentLoaded", () => {
    const quantities = document.querySelectorAll(".quantity");
    const totalDisplay = document.getElementById("total");
    const prices = [50, 25, 15]; // Day, Plan, Group
    const passNames = ["Day of Travel Pass", "Plan Ahead Pass", "Group Pass"];
  
    // Step 1: Pre-fill from selectpass.js if available
    const stored = localStorage.getItem("passBreakdown");
    if (stored) {
      try {
        const breakdown = JSON.parse(stored);
        passNames.forEach((name, index) => {
          const qty = breakdown[name] || 0;
          quantities[index].value = qty;
        });
      } catch (err) {
        console.warn("Could not parse passBreakdown from localStorage.");
      }
      localStorage.removeItem("passBreakdown"); // Clear after use
    }
  
    // Step 2: Update total when quantities change
    function calculateTotal() {
      let total = 0;
      quantities.forEach((input, index) => {
        const qty = parseInt(input.value) || 0;
        total += qty * prices[index];
        const subtotalEl = input.closest(".cart-item").querySelector(".subtotal");
        subtotalEl.textContent = `$${(qty * prices[index]).toFixed(2)}`;
      });
      totalDisplay.textContent = total.toFixed(2);
    }
  
    quantities.forEach(input => {
      input.addEventListener("input", calculateTotal);
    });
  
    calculateTotal();
  
    // Step 3: Proceed to payment
    document.querySelector(".checkout-btn").addEventListener("click", () => {
      const breakdown = {};
      let subtotal = 0;
  
      quantities.forEach((input, index) => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
          breakdown[passNames[index]] = qty;
          subtotal += qty * prices[index];
        }
      });
  
      const encoded = encodeURIComponent(JSON.stringify(breakdown));
      window.location.href = `passpayment.html?total=${subtotal.toFixed(2)}&breakdown=${encoded}`;
    });
  });
  