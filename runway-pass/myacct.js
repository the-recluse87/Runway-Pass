document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html"; // Redirect to login if not signed in
    return;
  }

  // Inject CSS for layout, hover, and action buttons
  const style = document.createElement("style");
  style.textContent = `
    #passes-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .pass-date {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      min-width: 250px;
      padding: 8px 16px;
      font-size: 1rem;
      background: #104ab5;
      border: 1px solid #ccc;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .pass-date:hover {
      background: rgb(14, 59, 143);
    }
    .date-left {
      text-align: left;
      flex: 1;
      color: #ffac01;
      font-weight: bold;
    }
    .route-right {
      text-align: right;
      flex: 1;
      font-weight: bold;
      letter-spacing: 1px;
      color: #fff;
    }
    .arrow {
      margin-left: 10px;
      transition: transform 0.2s;
      color: #fff;
    }
    .pass-item {
      margin-bottom: 18px;
      width: 100%;
    }
    .pass-image {
      display: block;
      max-width: 400px;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-top: 10px;
      margin-bottom: 10px;
      transition: transform 0.2s;
      cursor: pointer;
    }
    .pass-image:hover {
      transform: scale(1.05);
      z-index: 2;
    }
    .pass-action-group {
      display: flex;
      flex-direction: column;   /* Stack vertically */
      align-items: flex-start;  /* Align to the left */
      gap: 8px;
      margin-left: 16px;
      margin-top: 0;
    }
    .pass-action-btn {
      padding: 6px 12px;
      border-radius: 5px;
      border: none;
      background: #104ab5;
      color: #fff;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .pass-action-btn:hover {
      background: #ffac01;
      color: #104ab5;
    }
    .image-and-actions {
      display: flex;
      align-items: center;
      width: 100%;
    }
  `;
  document.head.appendChild(style);

  try {
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
    passes.sort((a, b) => new Date(a.date) - new Date(b.date));

    const passesContainer = document.getElementById("passes-container");
    passes.forEach((pass) => {
      const passElement = document.createElement("div");
      passElement.className = "pass-item";

      // Date/route button
      const dateContainer = document.createElement("div");
      dateContainer.className = "date-container";

      const dateElement = document.createElement("button");
      dateElement.className = "pass-date";

      // Left: Pretty date
      const dateObj = new Date(pass.date);
      const prettyDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      const dateSpan = document.createElement("span");
      dateSpan.className = "date-left";
      dateSpan.textContent = prettyDate;

      // Right: Route (e.g., DEN → WDC)
      const routeSpan = document.createElement("span");
      routeSpan.className = "route-right";
      routeSpan.textContent = `${pass.departure} \u2192 ${pass.arrival}`;

      // Dropdown arrow
      const arrowElement = document.createElement("span");
      arrowElement.className = "arrow";
      arrowElement.textContent = "▼";

      dateElement.appendChild(dateSpan);
      dateElement.appendChild(routeSpan);
      dateElement.appendChild(arrowElement);

      dateContainer.appendChild(dateElement);

      // Pass image (hidden by default)
      const imageElement = document.createElement("img");
      imageElement.className = "pass-image";
      imageElement.src = `data:image/png;base64,${pass.passImage}`;
      imageElement.style.display = "none";

      // Action buttons (hidden by default)
      const actionsGroup = document.createElement("div");
      actionsGroup.className = "pass-action-group";
      actionsGroup.style.display = "none";

      // Print button
      const printBtn = document.createElement("button");
      printBtn.className = "pass-action-btn";
      printBtn.textContent = "Print";
      printBtn.onclick = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Pass</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #fff; }
                img { max-width: 100%; max-height: 100vh; }
              </style>
            </head>
            <body>
              <img id="pass-img" src="${imageElement.src}" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      };

      // Download button
      const downloadBtn = document.createElement("button");
      downloadBtn.className = "pass-action-btn";
      downloadBtn.textContent = "Download";
      downloadBtn.onclick = () => {
        const a = document.createElement("a");
        a.href = imageElement.src;
        a.download = `${pass.departure}_${pass.arrival}_RunwayPass.png`;
        a.click();
      };

      actionsGroup.appendChild(printBtn);
      actionsGroup.appendChild(downloadBtn);

      // Layout: image and actions side by side
      const imageAndActions = document.createElement("div");
      imageAndActions.className = "image-and-actions";
      imageAndActions.appendChild(imageElement);
      imageAndActions.appendChild(actionsGroup);

      // Toggle image and actions visibility and arrow rotation on button click
      dateElement.addEventListener("click", (e) => {
        e.stopPropagation();
        const isVisible = imageElement.style.display === "block";
        imageElement.style.display = isVisible ? "none" : "block";
        actionsGroup.style.display = "none";
        arrowElement.style.transform = isVisible ? "rotate(0deg)" : "rotate(180deg)";
      });

      // Show/hide actions when clicking the image
      imageElement.onclick = (e) => {
        e.stopPropagation();
        actionsGroup.style.display = actionsGroup.style.display === "flex" ? "none" : "flex";
      };

      // Hide actions and image when clicking outside
      document.addEventListener("click", (e) => {
        if (!imageElement.contains(e.target) && !actionsGroup.contains(e.target) && !dateElement.contains(e.target)) {
          imageElement.style.display = "none";
          actionsGroup.style.display = "none";
          arrowElement.style.transform = "rotate(0deg)";
        }
      });

      passElement.appendChild(dateContainer);
      passElement.appendChild(imageAndActions);
      passesContainer.appendChild(passElement);
    });
  } catch (err) {
    console.error("Error loading passes:", err);
  }
});