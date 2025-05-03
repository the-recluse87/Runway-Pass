document.addEventListener("DOMContentLoaded", function () {
    fetch("top-nav-bar.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load top-nav-bar.html");
            }
            return response.text();
        })
        .then((html) => {
            document.getElementById("top-nav-bar").innerHTML = html;

            // Check if the user is logged in
            const token = localStorage.getItem("token"); // Check for the token in localStorage

            const loginButton = document.getElementById("login-button");
            const createAccountButton = document.getElementById("create-account-button");
            const myAccountButton = document.getElementById("my-account-button");
            const logoutButton = document.getElementById("logout-button");

            if (token) {
                // User is logged in
                if (loginButton) loginButton.style.display = "none";
                if (createAccountButton) createAccountButton.style.display = "none";
                if (myAccountButton) myAccountButton.style.display = "inline-block";
                if (logoutButton) {
                    logoutButton.style.display = "inline-block";
                    logoutButton.addEventListener("click", () => {
                        // Clear the token and reload the page
                        localStorage.removeItem("token");
                        alert("You have been logged out.");
                        window.location.reload();
                    });
                }
            } else {
                // User is not logged in
                if (loginButton) loginButton.style.display = "inline-block";
                if (createAccountButton) createAccountButton.style.display = "inline-block";
                if (myAccountButton) myAccountButton.style.display = "none";
                if (logoutButton) logoutButton.style.display = "none";
            }
        })
        .catch((error) => {
            console.error("Error loading top-nav-bar:", error);
        });
});