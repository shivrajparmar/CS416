document.addEventListener('DOMContentLoaded', function() {
    loadPage('page1.html');
});

let currentPageIndex = 0;
const pages = ['page1.html', 'page2.html', 'page3.html'];

document.getElementById('btn1').addEventListener('click', function() {
    loadPage(pages[0]);
    currentPageIndex = 0;
    updateNavButtons();
    
});

document.getElementById('btn2').addEventListener('click', function() {
    loadPage(pages[1]);
    currentPageIndex = 1;
    updateNavButtons();
});

document.getElementById('btn3').addEventListener('click', function() {
    loadPage(pages[2]);
    currentPageIndex = 2;
    updateNavButtons();
});

document.getElementById('prevBtn').addEventListener('click', function() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        loadPage(pages[currentPageIndex]);
        updateNavButtons();
    }
});

document.getElementById('nextBtn').addEventListener('click', function() {
    if (currentPageIndex < pages.length - 1) {
        currentPageIndex++;
        loadPage(pages[currentPageIndex]);
        updateNavButtons();
    }
});

function loadPage(page) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
            if (page === 'page1.html') {
                loadLineChart(); // Function to load the line chart visualization
            } else if (page === 'page2.html') {
                loadScatterPlot(); // Function to load the scatter plot visualization
            } else if (page === 'page3.html') {
                loadBarChart(); // Function to load the bar chart visualization
            }
        });
}

function updateNavButtons() {
    document.getElementById('prevBtn').disabled = (currentPageIndex === 0);
    document.getElementById('nextBtn').disabled = (currentPageIndex === pages.length - 1);
}

function loadLineChart() {
    const width = 960;
    const height = 500;

    const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Load and process the data
    d3.csv("USA_House_Prices.csv").then(data => {
        // Parse the data and create the line chart
    });
}

function loadScatterPlot() {
    const width = 960;
    const height = 500;

    const svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Load and process the data
    d3.csv("USA_House_Prices.csv").then(data => {
        // Parse the data and create the scatter plot
    });
}

function loadBarChart() {
    const width = 960;
    const height = 500;

    const svg = d3.select("#chart3")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Load and process the data
    d3.csv("USA_House_Prices.csv").then(data => {
        // Parse the data and create the bar chart
    });
}
