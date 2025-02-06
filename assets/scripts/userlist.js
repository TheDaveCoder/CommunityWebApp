let records = document.querySelectorAll('.table-data');
let tabBtns = document.querySelectorAll('.tab-col');
let selectedRecords = [];

// Table Records
records.forEach(record => {
    record.addEventListener('click', () => {
        recordCheckbox = record.querySelector('.chkbox');
        if (!(recordCheckbox.classList.contains('checked'))) {
            selectedRecords.push(record);
            recordCheckbox.classList.add('checked');
        } else {
            selectedRecords = selectedRecords.filter(selected => selected !== record);
            recordCheckbox.classList.remove('checked');
        }
    })
});

function addRecord(record) {
    recordCheckbox = record.querySelector('.chkbox');
    if (!(recordCheckbox.classList.contains('checked'))) {
        selectedRecords.push(record);
        recordCheckbox.classList.add('checked');
    } else {
        selectedRecords = selectedRecords.filter(selected => selected !== record);
        recordCheckbox.classList.remove('checked');
    }
}

// Tab Switch
tabBtns.forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
        selectedRecords = [];
        refresh(tabBtn.dataset.tabId);
    });
});

document.querySelector("#btn-reject").addEventListener('click', () => { rejectUser() });