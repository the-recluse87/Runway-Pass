document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".select-button");
  
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const passType = btn.dataset.pass;
  
        // Reset all values to 0
        const breakdown = {
          "Day of Travel Pass": 0,
          "Plan Ahead Pass": 0,
          "Group Pass": 0
        };
  
        // Set the selected pass to 1
        if (passType === "day") breakdown["Day of Travel Pass"] = 1;
        else if (passType === "plan") breakdown["Plan Ahead Pass"] = 1;
        else if (passType === "group") breakdown["Group Pass"] = 1;
  
        // Store breakdown in localStorage
        localStorage.setItem("passBreakdown", JSON.stringify(breakdown));
  
        // Redirect to purchase page
        window.location.href = "purchasepass.html";
      });
    });
  });
  