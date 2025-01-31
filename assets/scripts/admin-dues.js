let tableRecords = document.querySelectorAll(".table-data");
let overlay = document.querySelector(".overlay");
let popup = document.querySelector(".popup-prompt");

tableRecords.forEach(record => {
    record.addEventListener("click", () => {
        const recordID = record.dataset.recordId;
        showPrompt(recordID);
    })
})

function showPrompt(recordID) {
    console.log(recordID);
    let exitBtn = document.querySelector(".p-exit-icon");
    let cancelBtn = document.querySelector("#cancel");
    overlay.classList.add("ov-active");
    popup.classList.add("ov-active");

    exitBtn.addEventListener("click", () => closePrompt());
    cancelBtn.addEventListener("click", () => closePrompt());
    overlay.addEventListener("click", () => closePrompt());
}

function closePrompt() {
    popup.querySelectorAll("input").forEach(inp => inp.value = "");
    popup.classList.remove("ov-active");
    overlay.classList.remove("ov-active");
}