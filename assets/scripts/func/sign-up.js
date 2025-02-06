let passEqual = false;
document.querySelector("#confirm-password").addEventListener("input", (event) => {
    const password = document.querySelector("#password").value;
    const confirmPassword = event.target.value;

    if (password !== confirmPassword) {
        console.log("Passwords do not match!");
        passEqual = false;
    } else {
        passEqual = true;
    }
});

document.getElementById("submitBtn").addEventListener("click", async function (event) {
    console.log("Signing Up...");
    event.preventDefault();
    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;
    if (password !== confirmPassword) {
        console.log("Please match passwords!");
        return; // Early return
    }
    let accountStatus = "";
    if (document.querySelector("input[type='radio']").checked) {
        accountStatus = "regular_user";
    } else {
        accountStatus = "admin";
    }

    const formData = {
        account_type: accountStatus,
        first_name: document.getElementById("first-name").value,
        last_name: document.getElementById("last-name").value,
        block_lot_no: document.getElementById("block").value,
        street: document.getElementById("street").value,
        email: document.getElementById("email-address").value,
        contact_no: document.getElementById("contact-number").value,
        password: password
    };

    try {
        const response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/AccountAuth/RegisterCog", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const response_serialized = await response.json();
        if (response_serialized.statusCode === 200) {
            alert("Registration successful! Please wait for your account to be confirmed");
            window.location.href = "/sign-in.html";
        } else {
            alert("Error: " + response_serialized.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong!");
    }
});
