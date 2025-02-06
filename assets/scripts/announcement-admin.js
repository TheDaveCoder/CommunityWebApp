let addBtns = document.querySelectorAll(".add-announcement-btn");
let prompts = document.querySelectorAll(".popup-prompt");
let overlay = document.querySelector(".overlay");

addBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const promptType = btn.dataset.addId;
        showPrompt(promptType);
    })
})

function showPrompt(promptType) {
    let promptItem;
    let confirmBtn = document.querySelector("." + promptType + "-confirm");
    let exitBtn = document.querySelector("." + promptType + "-exit");
    let cancelBtn = document.querySelector("." + promptType + "-cancel");
    overlay.classList.add("ov-active");
    prompts.forEach(prompt => {
        if (prompt.id == promptType) {
            promptItem = prompt;
        }
    });
    promptItem.classList.add("ov-active");

    confirmBtn.addEventListener("click", () => { confirmPrompt(promptType, promptItem); });
    exitBtn.addEventListener("click", () => closePrompt(promptItem));
    cancelBtn.addEventListener("click", () => closePrompt(promptItem));
    overlay.addEventListener("click", () => closePrompt(promptItem));
}

function closePrompt(promptItem) {
    promptItem.querySelectorAll("input").forEach(input => input.value = '');
    promptItem.querySelector("textarea").value = '';
    promptItem.classList.remove("ov-active");
    overlay.classList.remove("ov-active");
}