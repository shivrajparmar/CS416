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
                // Implement the function to load the second chart
            } else if (page === 'page3.html') {
                // Implement the function to load the third chart
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
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");

    d3.csv("USA_Housing_Dataset.csv").then(data => {
        data.forEach(d => {
            d.date = parseDate(d.date);
            d.price = +d.price;
        });

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width - margin.left - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.price)])
            .range([height - margin.top - margin.bottom, 0]);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.price));

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom - margin.top})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // Annotations (example)
        svg.append("text")
            .attr("x", x(parseDate("2014-05-10 00:00:00")))
            .attr("y", y(800000))
            .attr("dy", "-0.5em")
            .attr("text-anchor", "middle")
            .style("fill", "red")
            .text("Example Peak");
    });
}
