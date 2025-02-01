let postBtn = document.querySelector("#new-post");
let overlay = document.querySelector(".overlay");
let popup = document.querySelector(".popup-prompt");

postBtn.addEventListener("click", () => {
    let exitBtn = document.querySelector(".p-exit-icon");
    let cancelBtn = document.querySelector("#cancel");
    overlay.classList.add("ov-active");
    popup.classList.add("ov-active");

    exitBtn.addEventListener("click", () => closePrompt());
    cancelBtn.addEventListener("click", () => closePrompt());
    overlay.addEventListener("click", () => closePrompt());
});

function closePrompt() {
    popup.querySelector("input").value = "";
    popup.querySelector("textarea").value = "";
    popup.classList.remove("ov-active");
    overlay.classList.remove("ov-active");
}