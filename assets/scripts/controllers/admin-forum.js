window.onload = async function () {
    await validateToken();
    await refresh();
};

async function refresh() {
    console.log("Fetching Data...");
    document.querySelector(".loading-uc.a").classList.add("active");
    // Await the fetch request directly without chaining `.then()`
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/ForumPost", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        }
    });
    let data = await response.json(); // Parse the JSON response
    let dataJson = JSON.parse(data.body);
    let templateFile = await ((await fetch("assets/templates/forum-cards.html")).text());
    let parser = new DOMParser();
    let templateDOM = parser.parseFromString(templateFile, "text/html");
    let templateEl = templateDOM.querySelector("template");
    let postCardWrapper = document.querySelector(".content");
    postCardWrapper.innerHTML = "";
    for (let record of dataJson["posts"]) {
        templateClone = templateEl.content.cloneNode(true);
        templateClone.querySelector(".card").dataset.postId = record["forumPostID"];
        templateClone.querySelector("h3").innerHTML = record["title"];
        templateClone.querySelector("p.body").innerHTML = record["postBody"];
        templateClone.querySelector("#up-react").innerHTML = record["upvoteCount"];
        templateClone.querySelector("p.comment_num").innerHTML = record["replyCount"];
        templateClone.querySelector("p.time").innerHTML = record["datePosted"];
        postCardWrapper.appendChild(templateClone);
        document.querySelector(`[data-post-id='${record["forumPostID"]}']`).addEventListener("click", () => { loadDetails(record["forumPostID"], record); });
    }
    console.log(dataJson);
    document.querySelector(".loading-uc.a").classList.remove("active");
}

async function loadDetails(forumID, postDetails) {
    document.querySelector(".empty").classList.remove("active");
    document.querySelector(".loading-uc.b").classList.add("active");
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/ForumPost/Replies", {
        method: "POST",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        },
        body: JSON.stringify({ "forumID": forumID })
    });
    let data = await response.json(); // Parse the JSON response
    let dataJson = JSON.parse(data.body);
    let templateFile = await ((await fetch("assets/templates/reply-card.html")).text());
    let parser = new DOMParser();
    let templateDOM = parser.parseFromString(templateFile, "text/html");
    let templateEl = templateDOM.querySelector("template");
    let repliesWrapper = document.querySelector(".thread-comments");
    let accountDetails = await getAccounts();
    // Load Post Body
    document.querySelector(".post-body-name").innerHTML = getAccountDetails(postDetails["postedBy"], accountDetails);
    document.querySelector(".post-body-body").innerHTML = postDetails["postBody"];
    document.querySelector(".post-body-upvote").innerHTML = postDetails["upvoteCount"];
    document.querySelector(".post-body-comment").innerHTML = postDetails["replyCount"];
    //Load Replies
    repliesWrapper.innerHTML = "";
    for (let reply of dataJson["replies"]) {
        console.log(reply);
        templateClone = templateEl.content.cloneNode(true);
        let replyN = getAccountDetails(reply["replierAccountID"], accountDetails);
        console.log(replyN);
        templateClone.querySelector("h4").innerHTML = replyN;
        templateClone.querySelector("span").innerHTML = reply["dateReplied"];
        templateClone.querySelector("p").innerHTML = reply["replyBody"];
        repliesWrapper.appendChild(templateClone);
    }
    console.log(dataJson);
    localStorage.setItem("forumID", forumID);
    localStorage.setItem("postDetails", JSON.stringify(postDetails));
    document.querySelector(".loading-uc.b").classList.remove("active");
}

async function getAccounts() {
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/UserAccount", {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        }
    });
    let data = await response.json(); // Parse the JSON response
    return JSON.parse(data.body);
}

function getAccountDetails(accountID, accounts) {
    for (record of accounts["confirmed_accounts"]) {
        if (record["cognitoSub"] == accountID) {
            return record["firstName"] + " " + record["lastName"];
        }
    }
    for (record of accounts["unconfirmed_accounts"]) {
        if (record["cognitoSub"] == accountID) {
            return record["firstName"] + " " + record["lastName"];
        }
    }
    return "Null";
}

async function createPost() {
    let body = {
        "title": document.querySelector(".title-in").value,
        "post_body": document.querySelector(".body-in").value
    }
    let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/ForumPost", {
        method: "POST",
        headers: {
            "Authorization": localStorage.getItem("id_token")
        },
        body: JSON.stringify(body)
    });
    if (response.ok) {
        closePrompt();
        refresh();
    } else {
        alert("Error!");
    }
    console.log(response);
    refresh();
}

async function upvote() {
    let upvote = document.querySelector(".post-body-upvote").innerHTML;
    let newUpvote = parseInt(upvote) + 1;
    console.log(newUpvote);
    let body = {
        "new_upvote_count": newUpvote,
        "post_id": localStorage.getItem("forumID")
    }
    let updated = JSON.parse(localStorage.getItem("postDetails"));
    updated["upvoteCount"] = newUpvote;
    localStorage.setItem("postDetails", JSON.stringify(updated));
    try {
        let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/ForumPost/Likes", {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("id_token")
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            refresh();
        } else {
            alert("Error!");
        }
    } catch (e) {
        console.log(e);
    }
    refresh();
    loadDetails(localStorage.getItem("forumID"), JSON.parse(localStorage.getItem("postDetails")));
}

document.querySelector(".chatbox").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addReply();
    }
});

async function addReply() {
    const replyText = document.querySelector(".chatbox").value.trim();  // Get the input value
    if (replyText) {
        let updated = JSON.parse(localStorage.getItem("postDetails"));
        let replyCount = updated["replyCount"];
        let newReplyCount = parseInt(replyCount) + 1;
        let body = {
            "new_reply_count": newReplyCount,
            "post_id": updated["forumPostID"],
            "reply_body": replyText
        }
        localStorage.setItem("postDetails", JSON.stringify(updated));
        let response = await fetch("https://jtkv6kki2l.execute-api.ap-southeast-1.amazonaws.com/Production/ForumPost/Replies", {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("id_token")
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            refresh();
            loadDetails(localStorage.getItem("forumID"), JSON.parse(localStorage.getItem("postDetails")));
        }
    }
}