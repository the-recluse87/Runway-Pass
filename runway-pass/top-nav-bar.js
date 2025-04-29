document.addEventListener("DOMContentLoaded", function () 
{
    fetch("top-nav-bar.html")
        .then((response) => 
            {
            if (!response.ok) 
            {
                throw new Error("Failed to load top-nav-bar.html");
            }
            return response.text();
        })
        .then((html) => 
        {
            document.getElementById("top-nav-bar").innerHTML = html;

            // Check if the user is logged in
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

            if (isLoggedIn) 
            {
                // Replace "Login" and "Create Account" with "My Account"
                const miniNav = document.getElementById("mini-nav");
                if (miniNav) 
                {
                    miniNav.innerHTML = 
                    `
                        <a href="myacct.html" class="minitab">My Account</a>
                    `;
                }
            }
        })
        .catch((error) => 
        {
            console.error("Error loading top-nav-bar:", error);
        });
});