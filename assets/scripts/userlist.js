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

// Tab Switch
tabBtns.forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
        if (tabBtn.dataset.tabId == "2") {
            document.querySelector('.pendingrequest-column').classList.add('active');
            document.querySelector('.reqlist').classList.add('active');

        } else {
            document.querySelector('.pendingrequest-column').classList.remove('active');
            document.querySelector('.reqlist').classList.remove('active');
        }

        // Refresh Table
        // Code
    });
});