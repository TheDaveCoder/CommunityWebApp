let tableRecords = document.querySelectorAll(".table-data");
let overlay = document.querySelector(".overlay");
let popup = document.querySelector(".popup-prompt");

tableRecords.forEach(record => {
    record.addEventListener("click", () => {
        const recordID = record.dataset.recordId;
        showPrompt(recordID);
    })
})

async function showPrompt(recordID) {
    console.log(recordID);
    let exitBtn = document.querySelector(".p-exit-icon");
    let cancelBtn = document.querySelector("#cancel");
    overlay.classList.add("ov-active");
    popup.classList.add("ov-active");

    console.log("Fetching Data...");
    document.querySelector(".loading-uc").classList.add("active");
    // For Users
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/UserAccount", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        }
    });
    let data = await response.json(); // Parse the JSON response
    let dataJson = JSON.parse(data.body);
    // Filter accounts with accountType "regular_user"
    const confirmedRecords = dataJson.confirmed_accounts.filter(account => account.accountType === "regular_user");
    const unconfirmedRecords = dataJson.unconfirmed_accounts.filter(account => account.accountType === "regular_user");
    let combinedRecords = [...confirmedRecords, ...unconfirmedRecords];
    let filteredRecords = combinedRecords.filter(account => account.accountStatus === "confirmed");
    let fullName = "N/A";
    for (record of filteredRecords) {
        console.log(record);
        console.log(recordID);
        if (recordID == record["cognitoSub"]) {
            fullName = record["firstName"] + " " + record["lastName"];
        }
    }
    document.querySelector(".accountName").innerHTML = fullName;
    document.querySelector(".loading-uc").classList.remove("active");

    // document.querySelector("#input-prev-bill").addEventListener("input", e => { updateRemBal() });
    // document.querySelector("#input-payments-and-credits").addEventListener("input", e => { updateRemBal() });
    // document.querySelector("#input-prev-readings").addEventListener("input", updateFtmBal(val));
    console.log()
    document.querySelector("#confirm").addEventListener("click", () => createBalance(recordID));
    exitBtn.addEventListener("click", () => closePrompt());
    cancelBtn.addEventListener("click", () => closePrompt());
    overlay.addEventListener("click", () => closePrompt());
}

function closePrompt() {
    popup.querySelectorAll("input").forEach(inp => inp.value = "0");
    popup.querySelectorAll(".ato").forEach(inp => inp.innerHTML = "0");
    popup.classList.remove("ov-active");
    overlay.classList.remove("ov-active");
}

// function updateRemBal(val) {
//     let remBal = parseFloat(document.querySelectorAll("#remBal"));
//     let prevBill = document.querySelector("#input-prev-bill");
//     let pac = document.querySelector("#input-payments-and-credits");
//     remBal = prevBill - pac;
//     document.querySelectorAll("#remBal").innerHTML = remBal;
// }

// function updateFtmBal(val) {
//     let remBal = parseFloat(document.querySelectorAll("#ftmr"));
//     let prevBill = document.querySelector("#input-prev-readings");
//     let pac = document.querySelector("#input-pres-readings");
//     remBal = pac - prevBill;
//     document.querySelectorAll("#ftmr").innerHTML = remBal;
// }