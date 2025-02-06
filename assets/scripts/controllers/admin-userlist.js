window.onload = async function () {
    await validateToken();
    await refresh("1");
};

async function refresh(tableViewType) {
    console.log("Fetching Data...");
    document.querySelector(".loading-uc").classList.add("active");
    // Await the fetch request directly without chaining `.then()`
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/UserAccount", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        }
    });
    let data = await response.json(); // Parse the JSON response
    let dataJson = JSON.parse(data.body);
    const confirmedRecords = dataJson.confirmed_accounts.filter(account => account.accountType === "regular_user");
    const unconfirmedRecords = dataJson.unconfirmed_accounts.filter(account => account.accountType === "regular_user");
    let templateFile = await ((await fetch("assets/templates/account-table-rows.html")).text());
    let parser = new DOMParser();
    let templateDOM = parser.parseFromString(templateFile, "text/html");
    let templateEl = templateDOM.querySelector("template");
    if (tableViewType == "1") {
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        for (let record of confirmedRecords) {
            templateClone = templateEl.content.cloneNode(true);
            templateClone.querySelector(".table-data").dataset.cognitoSub = record.cognitoSub;
            templateClone.querySelector("#firstName").innerHTML = record.firstName;
            templateClone.querySelector("#lastName").innerHTML = record.lastName;
            templateClone.querySelector("#blockLotNumber").innerHTML = record.blockLotNumber;
            templateClone.querySelector("#streetName").innerHTML = record.streetName;
            templateClone.querySelector("#email").innerHTML = record.email;
            templateClone.querySelector("#contactNumber").innerHTML = record.contactNumber;
            tbody.appendChild(templateClone);
            let addedItem = document.querySelector(`[data-cognito-sub='${record.cognitoSub}']`);
            addedItem.addEventListener("click", e => { addRecord(addedItem) });
        }
        document.querySelector('.pendingrequest-column').classList.remove('active');
        document.querySelector('.reqlist').classList.remove('active');
    } else if (tableViewType == "2") {
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        for (let record of unconfirmedRecords) {
            templateClone = templateEl.content.cloneNode(true);
            templateClone.querySelector(".table-data").dataset.cognitoSub = record.cognitoSub;
            templateClone.querySelector("#firstName").innerHTML = record.firstName;
            templateClone.querySelector("#lastName").innerHTML = record.lastName;
            templateClone.querySelector("#blockLotNumber").innerHTML = record.blockLotNumber;
            templateClone.querySelector("#streetName").innerHTML = record.streetName;
            templateClone.querySelector("#email").innerHTML = record.email;
            templateClone.querySelector("#contactNumber").innerHTML = record.contactNumber;
            document.querySelector("tbody").appendChild(templateClone);
            let addedItem = document.querySelector(`[data-cognito-sub='${record.cognitoSub}']`);
            addedItem.addEventListener("click", e => { addRecord(addedItem) });
        }
        document.querySelector('.pendingrequest-column').classList.add('active');
        document.querySelector('.reqlist').classList.add('active');
    }
    console.log(confirmedRecords);
    console.log(unconfirmedRecords);
    document.querySelector(".loading-uc").classList.remove("active");
}

async function acceptUser() {
    if (selectedRecords.length == 0) {
        return
    }
    console.log(selectedRecords)
    document.querySelector(".loading-uc").classList.add("active");
    console.log(selectedRecords);
    for (recep of selectedRecords) {
        let body = {
            "recepient": recep.dataset.cognitoSub
        }
        let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/UserAccount", {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("id_token")
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            console.log("Success!");
        } else {
            alert("Error!");
            break;
        }
    }
    document.querySelector(".loading-uc").classList.remove("active");
    refresh("2");
    selectedRecords = [];
}

async function rejectUser() {
    console.log("Rejecting..");
    if (selectedRecords.length == 0) {
        return
    }
    // document.querySelector(".loading-uc").classList.add("active");
    console.log(selectedRecords);
    for (recep of selectedRecords) {
        let body = {
            "account_id": recep.dataset.cognitoSub,
            "account_type": "unconfirmed",
            "account_email": recep.querySelector("#email").innerHTML
        }
        let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/UserAccount/TempDelCog", {
            method: "POST",
            headers: {
                "Authorization": localStorage.getItem("id_token")
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            let responseData = await response.json();
            console.log(responseData);
        } else {
            console.log("Error!");
        }
    }
    // document.querySelector(".loading-uc").classList.remove("active");
    refresh("2");
    selectedRecords = [];
}

async function deleteUser() {
    console.log("Rejecting..");
    if (selectedRecords.length == 0) {
        return
    }
    // document.querySelector(".loading-uc").classList.add("active");
    console.log(selectedRecords);
    for (recep of selectedRecords) {
        let body = {
            "account_id": recep.dataset.cognitoSub,
            "account_type": "confirmed",
            "account_email": recep.querySelector("#email").innerHTML
        }
        let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/UserAccount/TempDelCog", {
            method: "POST",
            headers: {
                "Authorization": localStorage.getItem("id_token")
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            let responseData = await response.json();
            console.log(responseData);
        } else {
            console.log("Error!");
        }
    }
    // document.querySelector(".loading-uc").classList.remove("active");
    refresh("1");
    selectedRecords = [];
}