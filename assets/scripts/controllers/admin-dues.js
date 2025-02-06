window.onload = async function () {
    await validateToken();
    await refresh();
};

async function refresh(tableViewType) {
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

    // For Dues
    let responseDues = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/Dues/GetAllDues", {
        method: "POST",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        }
    });
    let dataDues = await responseDues.json();
    console.log(dataDues);
    let duesRecordsAF = dataDues["associationFee"];
    let duesRecordsWB = dataDues["waterBill"];

    // For template
    let templateFile = await ((await fetch("assets/templates/admin-dues.html")).text());
    let parser = new DOMParser();
    let templateDOM = parser.parseFromString(templateFile, "text/html");
    let templateEl = templateDOM.querySelector("template");
    let tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    // Display records
    for (let record of filteredRecords) {
        let total = 0;
        let dueID = 0;
        for (let afRecord of duesRecordsAF) {
            if (afRecord["AccountID"] == record["cognitoSub"]) {
                total += parseFloat(afRecord["currentDue"]);
                dueID = parseFloat(afRecord["DueID"]);
            }
        }
        for (let wbRecord of duesRecordsWB) {
            if (wbRecord["AccountID"] == record["cognitoSub"]) {
                total += parseFloat(wbRecord["EGTotal"]);
                dueID = parseFloat(wbRecord["DueID"]);
            }
        }
        templateClone = templateEl.content.cloneNode(true);
        templateClone.querySelector(".table-data").dataset.recordId = record.cognitoSub; //temporary
        templateClone.querySelector("#firstName").innerHTML = record.firstName;
        templateClone.querySelector("#lastName").innerHTML = record.lastName;
        templateClone.querySelector("#blockLotNumber").innerHTML = record.blockLotNumber;
        templateClone.querySelector("#streetName").innerHTML = record.streetName;
        templateClone.querySelector("#currentBal").innerHTML = total;
        tbody.appendChild(templateClone);
        document.querySelector(`[data-record-id='${record.cognitoSub}']`).addEventListener("click", () => { showPrompt(record.cognitoSub) });
    }
    console.log(filteredRecords);
    console.log(duesRecordsAF);
    console.log(duesRecordsWB);
    document.querySelector(".loading-uc").classList.remove("active");
}

async function createBalance(cs) {
    console.log("active!");
    document.querySelector(".loading-uc").classList.add("active");
    let accountID = cs;
    bpStart = document.querySelector("#input-billing-period-start").value;
    bpEnd = document.querySelector("#input-billing-period-end").value;
    let billingPeriod = getBillingPeriod(bpStart, bpEnd);
    let dueDate = document.querySelector("#input-due-date");
    let previousAmount = document.querySelector("#input-prev-bill");
    let previousPayments = document.querySelector("#input-payments-and-credits");
    let remainingBalance = document.querySelector("#rembal");
    let currentDue = document.querySelector("#af-fc");
    let customerName = document.querySelector(".accountName");
    let previousConsumption = document.querySelector("#input-prev-readings");
    let presentConsumption = document.querySelector("#input-pres-readings");
    let basicCharges = document.querySelector("#input-billing-period");
    let environmentalCharges = document.querySelector("#input-env-charge");
    let sewerCharges = document.querySelector("#input-sewer-charge");
    let totalBill = document.querySelector(".tb");
    let vatInclusiveTotal = document.querySelector("#input-unpaid");
    let egTotal = document.querySelector(".finalee");

    let body = {
        "account_ID": accountID,
        "billing_period": billingPeriod,
        "due_date": dueDate,
        "previous_amount": previousAmount,
        "previous_payments": previousPayments,
        "remaining_balance": remainingBalance,
        "current_due": currentDue,
        "customer_name": customerName,
        "previous_consumption": previousConsumption,
        "present_consumption": presentConsumption,
        "basic_charges": basicCharges,
        "environmental_charges": environmentalCharges,
        "sewer_charges": sewerCharges,
        "total_bill": totalBill,
        "vat_inclusive_total": vatInclusiveTotal,
        "eg_total": egTotal
    }
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/Dues", {
        method: "PUT",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        },
        body: JSON.stringify(body)
    });
    if (response.ok) {
        console.log("Success!");
        closePrompt();
        document.querySelector(".loading-uc").classList.remove("active");
        refresh();
    } else {
        alert("Error!");
    }
}

function getBillingPeriod(startDat, endDat) {
    let startDate = new Date(startDat);
    let endDate = new Date(endDat);
    // Array of month abbreviations
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const startMonth = monthNames[startDate.getMonth()]; // Get the start month abbreviation
    const endMonth = monthNames[endDate.getMonth()];     // Get the end month abbreviation
    const year = endDate.getFullYear();                  // Get the year from the end date
    return `${startMonth}-${endMonth} ${year}`;
}