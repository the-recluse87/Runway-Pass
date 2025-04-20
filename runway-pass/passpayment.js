document.addEventListener("DOMContentLoaded", () => {
    const subtotalEl = document.getElementById("subtotalDisplay");
    const taxEl = document.getElementById("taxDisplay");
    const totalEl = document.getElementById("totalDisplay");
    const breakdownEl = document.getElementById("itemBreakdown");
  
    const params = new URLSearchParams(window.location.search);
    const breakdownParam = params.get("breakdown");
    const totalParam = parseFloat(params.get("total")) || 0;
  
    let breakdown;
    try {
      breakdown = breakdownParam ? JSON.parse(decodeURIComponent(breakdownParam)) : {};
    } catch (e) {
      breakdown = {};
    }
  
    let subtotal = 0;
    breakdownEl.innerHTML = ""; // Clear in case of reload
  
    for (const [item, qty] of Object.entries(breakdown)) {
      if (qty > 0) {
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
  
    document.getElementById("paymentForm").addEventListener("submit", function (e) {
        e.preventDefault();
        document.getElementById("confirmationMessage").style.display = "block";
      
        // ✅ Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = "paymentconfirmation.html";
        }, 2000);
      });
      
    });
  