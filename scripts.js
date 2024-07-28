document.getElementById('btn1').addEventListener('click', function() {
    loadPage('page1.html');
});

document.getElementById('btn2').addEventListener('click', function() {
    loadPage('page2.html');
});

document.getElementById('btn3').addEventListener('click', function() {
    loadPage('page3.html');
});

function loadPage(page) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
            if (page === 'page1.html') {
                loadMap(); // Function to load the map visualization
            } else if (page === 'page2.html') {
                loadBarChart(); // Function to load the bar chart visualization
            } else if (page === 'page3.html') {
                loadLineChart(); // Function to load the line chart visualization
            }
        });
}

function loadMap() {
    // D3.js code to create the map visualization
}

function loadBarChart() {
    // D3.js code to create the bar chart visualization
}

function loadLineChart() {
    // D3.js code to create the line chart visualization
}
