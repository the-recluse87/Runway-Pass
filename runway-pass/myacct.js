document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html"; // Redirect to login if not signed in
    return;
  }

  try {
    // Fetch runway passes for the logged-in user
    const response = await fetch('/get-user-passes', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch runway passes");
    }

    const passes = await response.json();

    // Display the passes on the page
    const passesContainer = document.getElementById("passes-container");
    passes.forEach((pass) => {
      const passElement = document.createElement("div");
      passElement.className = "pass-item";

      // Create a clickable date element with a dropdown arrow
      const dateContainer = document.createElement("div");
      dateContainer.className = "date-container";

      const dateElement = document.createElement("button");
      dateElement.className = "pass-date";
      dateElement.textContent = pass.date;

      const arrowElement = document.createElement("span");
      arrowElement.className = "dropdown-arrow";
      arrowElement.textContent = "▼";

      dateContainer.appendChild(dateElement);
      dateContainer.appendChild(arrowElement);

      // Create the image element (initially hidden)
      const imageElement = document.createElement("img");
      imageElement.className = "pass-image";
      imageElement.src = `data:image/png;base64,${pass.passImage}`;
      imageElement.style.display = "none";

      // Toggle image visibility and arrow rotation on click
      dateElement.addEventListener("click", () => {
        const isVisible = imageElement.style.display === "block";
        imageElement.style.display = isVisible ? "none" : "block";
        arrowElement.style.transform = isVisible ? "rotate(0deg)" : "rotate(180deg)";
      });

      passElement.appendChild(dateContainer);
      passElement.appendChild(imageElement);
      passesContainer.appendChild(passElement);
    });
  } catch (err) {
    console.error("Error loading passes:", err);
  }
});