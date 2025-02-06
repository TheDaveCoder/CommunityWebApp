document.getElementById("loginBtn").addEventListener("click", function (event) {
    console.log("Logging in...");
    event.preventDefault();
    const email = document.getElementById("input-email").value;
    const password = document.getElementById("input-pass").value;

    const requestBody = {
        "username": email,
        "password": password
    };

    console.log(JSON.stringify(requestBody));

    // Send POST request to login API
    fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/AccountAuth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => {
            if (data.body) {
                // The access token is inside the 'body' property as a string
                const responseBody = JSON.parse(data.body);  // Parse the 'body' property
                const token = responseBody.IdToken;  // Extract access_token
                console.log(responseBody)
                // Store token in localStorage
                localStorage.setItem("id_token", token);

                // Decode the JWT token
                const payload = JSON.parse(atob(token.split(".")[1]));
                console.log(payload);
                const userGroups = payload["cognito:groups"] || [];  // Extract user groups

                // Redirect based on user group
                if (userGroups.includes("admin")) {
                    window.location.href = "admin-userlist.html";  // Redirect Admin
                } else {
                    window.location.href = "dashboard.html";  // Redirect Regular User
                }
                console.log()
            } else {
                alert("Invalid login. Please try again.");
            }
        })
        .catch(error => {
            alert("Incorrect email or password..");
            console.error("Error:", error)
        });
});
