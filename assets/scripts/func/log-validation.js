async function validateToken() {
    document.querySelector(".loading").classList.add("active");
    console.log("Verifying Token...");
    const token = localStorage.getItem("id_token");

    // If there's no token, redirect to login page
    if (!token) {
        console.log("no token detected");
        window.location.href = "sign-in.html";
        return;
    }

    // Check the token validity (by sending a request to /testToken)
    fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/AccountAuth/Verify", {
        method: "GET",
        headers: {
            "Authorization": token
        }
    })
        .then(response => {
            if (response.status == 200) {
                // Token is valid, let the page load normally
                console.log("Token is valid");
                // Decode the JWT token
                const payload = JSON.parse(atob(token.split(".")[1]));
                const userGroups = payload["cognito:groups"] || [];  // Extract user groups
                console.log(userGroups);
                if (userGroups.includes("confirmed")) {
                    if (window.location.pathname.includes("admin")) {
                        if (userGroups.includes("regular_user")) {
                            alert("Access Denied");
                            window.location.href = "dashboard.html";
                        }
                    } else {
                        if (userGroups.includes("admin")) {
                            alert("Invalid Account Type");
                            window.location.href = "admin-userlist.html";
                        }
                    }
                } else {
                    alert("Account Confirmation Pending");
                    window.location.href = "/sign-in.html";
                }
            } else {
                alert("Token is invalid");
                // Token is expired or invalid, redirect to login
                window.location.href = "/sign-in.html";
            }
            document.querySelector(".loading").classList.remove("active");
        })
        .catch(error => {
            // In case of error (e.g., network issues or invalid token), redirect to login
            alert("Error checking token:", error);
            window.location.href = "/sign-in.html";
        });
};
