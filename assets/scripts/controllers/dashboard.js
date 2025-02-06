window.onload = async function () {
    await validateToken();
    await refresh();
};

async function refresh() {
    console.log("Fetching Data...");
    document.querySelector(".loading").classList.add("active");
    // Await the fetch request directly without chaining `.then()`
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/Dashboard", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        }
    });
    let data = await response.json(); // Parse the JSON response
    const announcementsList = data["announcementsList"];
    const currentBalance = data["currentBalance"];
    const currentEvents = data["currentEvents"];
    const currentEventsDetails = data["currentEventsDetails"];
    const forumPosts = data["forumPosts"];
    const forumTopLists = data["forumTopList"];
    const pastEvents = data["pastEvents"];

    // fetch templates
    let tempCurrEvents = await ((await fetch("assets/templates/current-announcements.html")).text());
    let tempPastEvents = await ((await fetch("assets/templates/past-announcements.html")).text());
    let tempAnnouncements = await ((await fetch("assets/templates/all_announcements.html")).text());
    let tempForumPosts = await ((await fetch("assets/templates/forum_posts.html")).text());
    let tempTrending = await ((await fetch("assets/templates/trending_posts.html")).text());
    let parser = new DOMParser();
    // parse to DOM
    let tempCurrEventsDOM = parser.parseFromString(tempCurrEvents, "text/html");
    let tempPastEventsDOM = parser.parseFromString(tempPastEvents, "text/html");
    let tempAnnouncementsDOM = parser.parseFromString(tempAnnouncements, "text/html");
    let tempForumPostsDOM = parser.parseFromString(tempForumPosts, "text/html");
    let tempTrendingDOM = parser.parseFromString(tempTrending, "text/html");
    // get template element
    let tempCurrEventsEl = tempCurrEventsDOM.querySelector("template");
    let tempPastEventsEl = tempPastEventsDOM.querySelector("template");
    let tempAnnouncementsEl = tempAnnouncementsDOM.querySelector("template");
    let tempForumPostsEl = tempForumPostsDOM.querySelector("template");
    let tempTrendingEl = tempTrendingDOM.querySelector("template");

    // Current Events
    for (let record of currentEventsDetails) {
        let event_start = "";
        let event_end = "";
        for (let event of currentEvents) {
            if (event["AnnouncementID"] == record[0]["AnnouncementID"]) {
                event_start = event["Event_start_date"];
                event_end = event["Event_end_date"];
            }
        }
        templateClone = tempCurrEventsEl.content.cloneNode(true);
        let ds = new Date(record[0]["datePosted"]);
        let monthName = ds.toLocaleString('default', { month: 'short' }).toUpperCase();
        datePosted = monthName + "-" + ds.getDate();
        templateClone.querySelector("#date").innerHTML = datePosted;
        templateClone.querySelector("#start-time").innerHTML = event_start.substring(11);
        templateClone.querySelector("#end-time").innerHTML = event_end.substring(11);
        templateClone.querySelector(".ann-item-title").innerHTML = record[0]["title"];
        templateClone.querySelector(".ann-item-subtitle").innerHTML = record[0]["description"];
        document.querySelector(".announcement-current").appendChild(templateClone);
    }

    // Past Events
    // pastEvents.pop();
    // console.log(pastEvents);
    // for (let record of pastEvents) {
    //     templateClone = tempPastEventsEl.content.cloneNode(true);
    //     templateClone.querySelector(".prev-item-title").innerHTML = record["title"];
    //     templateClone.querySelector(".prev-item-subtitle").innerHTML = record["description"];
    //     templateClone.querySelector(".prev-item-recent").innerHTML = record["datePosted"];
    //     document.querySelector(".ann-prev-item-wrapper").appendChild(templateClone);
    // }

    //Announcements
    for (let record of announcementsList) {
        templateClone = tempAnnouncementsEl.content.cloneNode(true);
        if (announcementsList["AnnouncementType"] == "urgent") {
            templateClone.querySelector(".item-announcement").classList.add("urgent");
        } else if (announcementsList["AnnouncementType"] == "event") {
            templateClone.querySelector(".item-announcement").classList.add("event");
        } else {
            templateClone.querySelector(".item-announcement").classList.add("notice");
        }
        templateClone.querySelector(".item-announcement-title").innerHTML = ["title"];
        templateClone.querySelector(".item-announcement-date").innerHTML = record["datePosted"];
        templateClone.querySelector(".item-announcement-body-lower").innerHTML = record["description"];
        document.querySelector("#all_announcements").appendChild(templateClone);
    }

    //Forum
    for (let record of forumPosts) {
        templateClone = tempForumPostsEl.content.cloneNode(true);
        templateClone.querySelector(".item-forum-title").innerHTML = record["title"];
        templateClone.querySelector(".item-forum-subtitle").innerHTML = record["postBody"];
        templateClone.querySelector(".ucc-upvote").innerHTML = record["upvoteCount"];
        templateClone.querySelector(".ucc-comment").innerHTML = record["replyCount"];
        templateClone.querySelector(".item-forum-recency").innerHTML = record["datePosted"];
        document.querySelector("#Forum_Posts").appendChild(templateClone);
    }

    // Trending
    console.log(forumTopLists);
    for (let record of forumTopLists) {
        templateClone = tempTrendingEl.content.cloneNode(true);
        templateClone.querySelector(".item-forum-title").innerHTML = record["title"];
        templateClone.querySelector(".item-forum-subtitle").innerHTML = record["postBody"];
        templateClone.querySelector(".ucc-upvote").innerHTML = record["upvoteCount"];
        templateClone.querySelector(".ucc-comment").innerHTML = record["replyCount"];
        templateClone.querySelector(".item-forum-recency").innerHTML = record["datePosted"];
        document.querySelector("#trending_posts").appendChild(templateClone);
    }

    // Update Balance
    document.querySelector(".item-dd-due").innerHTML = currentBalance;
    // console.log(currentEventsDetails);
    // console.log(currentEvents);
    document.querySelector(".loading").classList.remove("active");
}
