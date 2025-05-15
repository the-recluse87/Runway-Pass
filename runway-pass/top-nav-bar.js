document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    // Get nav item containers
    const loginNav = document.getElementById("login-nav");
    const createAcctNav = document.getElementById("create-account-nav");
    const myAcctNav = document.getElementById("my-account-nav");
    const logoutNav = document.getElementById("logout-nav");
    const logoutBtn = document.getElementById("logout-button");

    // Show/hide links based on login status
    if (token) {
        // Show My Account and Log Out, hide Create Account and Log In
        if (loginNav) loginNav.style.display = "none";
        if (createAcctNav) createAcctNav.style.display = "none";
        if (myAcctNav) myAcctNav.style.display = "";
        if (logoutNav) logoutNav.style.display = "";
        if (logoutBtn) {
            logoutBtn.onclick = function (event) {
                event.preventDefault();
                localStorage.removeItem("token");
                alert("You have been logged out.");
                window.location.reload();
            };
        }
    } else {
        // Show Create Account and Log In, hide My Account and Log Out
        if (loginNav) loginNav.style.display = "";
        if (createAcctNav) createAcctNav.style.display = "";
        if (myAcctNav) myAcctNav.style.display = "none";
        if (logoutNav) logoutNav.style.display = "none";
    }

    // Dynamically add | dividers between visible links
    const miniNav = document.querySelector("#mini-nav > div") || document.getElementById("mini-nav");
    if (miniNav) {
        // Remove any existing dividers
        Array.from(miniNav.querySelectorAll('.divider')).forEach(div => div.remove());

        // Get all visible nav links
        const visibleLinks = Array.from(miniNav.querySelectorAll("a"))
    .filter(el => {
        // Only count links that are visible (and whose parent is visible, for spans)
        const parent = el.parentElement;
        return el.style.display !== "none" &&
               (!parent || parent.style.display !== "none");
    });

        // Add dividers between them
        visibleLinks.forEach((el, idx) => {
            if (idx < visibleLinks.length - 1) {
                const divider = document.createElement("span");
                divider.textContent = " | ";
                divider.className = "divider";
                el.after(divider);
            }
        });
    }
});