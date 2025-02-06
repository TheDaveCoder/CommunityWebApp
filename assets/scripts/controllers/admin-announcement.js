window.onload = async function () {
    await validateToken();
    await refresh();
};

async function refresh() {
    console.log("Fetching Data...");
    for (doc of document.querySelectorAll(".loading-uc")) { doc.classList.add("active"); }
    // Await the fetch request directly without chaining `.then()`
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/Announcements", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        }
    });
    let data = await response.json(); // Parse the JSON response
    let dataJson = JSON.parse(data.body);
    let templateFile = await ((await fetch("assets/templates/announcement-card.html")).text());
    let parser = new DOMParser();
    let templateDOM = parser.parseFromString(templateFile, "text/html");
    let templateEl = templateDOM.querySelector("template");
    let urgentWrapper = document.querySelector("#urgent-wrapper");
    let eventWrapper = document.querySelector("#event-wrapper");
    let noticeWrapper = document.querySelector("#notice-wrapper");
    urgentWrapper.innerHTML = "";
    eventWrapper.innerHTML = "";
    noticeWrapper.innerHTML = "";
    for (let record of dataJson["urgent"]) {
        templateClone = templateEl.content.cloneNode(true);
        templateClone.querySelector("h3").innerHTML = record["title"];
        templateClone.querySelector("p").innerHTML = record["description"];
        templateClone.querySelector(".time").innerHTML = record["datePosted"];
        urgentWrapper.appendChild(templateClone);
    }
    for (let record of dataJson["event_obj"]["events"]) {
        let start_time = "";
        let end_time = "";
        for (let event of dataJson["event_obj"]["event_details"]) {
            if (record["AnnouncementID"] == event["AnnouncementID"]) {
                start_time = event["Event_start_date"];
                end_time = event["Event_end_date"];
            }
        }
        templateClone = templateEl.content.cloneNode(true);
        templateClone.querySelector("h3").innerHTML = record["title"];
        templateClone.querySelector("p").innerHTML = record["description"];
        if (start_time == "" || end_time == "") {
            templateClone.querySelector(".time").innerHTML = "<u>No date specified</u>";
        } else {
            templateClone.querySelector(".time").innerHTML = "<u>" + start_time + "</u>" + " to " + "<u>" + end_time + "</u>";
        }
        eventWrapper.appendChild(templateClone);
    }
    for (let record of dataJson["notice"]) {
        templateClone = templateEl.content.cloneNode(true);
        templateClone.querySelector("h3").innerHTML = record["title"];
        templateClone.querySelector("p").innerHTML = record["description"];
        templateClone.querySelector(".time").innerHTML = record["datePosted"];
        noticeWrapper.appendChild(templateClone);
    }
    console.log(dataJson["event_obj"]);
    for (doc of document.querySelectorAll(".loading-uc")) { doc.classList.remove("active"); }
}

async function confirmPrompt(at, promptItem) {
    announcementType = "";
    if (at == "p-urgent") {
        announcementType = "urgent";
    } else if (at == "p-event") {
        announcementType = "event";
    } else if (at == "p-notice") {
        announcementType = "notice";
    }
    let body = {
        "announcement_type": announcementType,
        "title": promptItem.querySelector(".ne-title").value,
        "description": promptItem.querySelector(".ne-body").value
    }
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/Announcements", {
        method: "POST",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        },
        body: JSON.stringify(body)
    });
    if (response.ok) {
        promptItem.querySelectorAll("input").forEach(input => input.value = '');
        promptItem.querySelector("textarea").value = '';
        promptItem.classList.remove("ov-active");
        overlay.classList.remove("ov-active");
        refresh();
    } else {
        alert("Error!");
    }
    console.log(response);
}