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
                loadBoxPlotByBedrooms();
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

function loadBoxPlotByBedrooms() {
    const width = 960;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("USA_Housing_Dataset.csv").then(data => {
        data.forEach(d => {
            d.price = +d.price;
            d.bedrooms = +d.bedrooms;
        });

        const x = d3.scaleBand()
            .domain([...new Set(data.map(d => d.bedrooms))])
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.price)])
            .nice()
            .range([height - margin.top - margin.bottom, 0]);

        const boxData = d3.nest()
            .key(d => d.bedrooms)
            .rollup(values => {
                const q1 = d3.quantile(values.map(d => d.price).sort(d3.ascending), 0.25);
                const median = d3.quantile(values.map(d => d.price).sort(d3.ascending), 0.5);
                const q3 = d3.quantile(values.map(d => d.price).sort(d3.ascending), 0.75);
                const interQuantileRange = q3 - q1;
                const min = d3.min(values, d => d.price);
                const max = d3.max(values, d => d.price);
                return { q1, median, q3, interQuantileRange, min, max };
            })
            .entries(data);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d3.format("$.2s")));

        const boxWidth = x.bandwidth() * 0.8;

        svg.selectAll(".box")
            .data(boxData)
            .enter()
            .append("rect")
            .attr("class", "box")
            .attr("x", d => x(d.key) - boxWidth / 2)
            .attr("y", d => y(d.value.q3))
            .attr("height", d => y(d.value.q1) - y(d.value.q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#69b3a2");

        svg.selectAll(".median")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "median")
            .attr("x1", d => x(d.key) - boxWidth / 2)
            .attr("x2", d => x(d.key) + boxWidth / 2)
            .attr("y1", d => y(d.value.median))
            .attr("y2", d => y(d.value.median))
            .attr("stroke", "black");

        svg.selectAll(".min")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "min")
            .attr("x1", d => x(d.key) - boxWidth / 2)
            .attr("x2", d => x(d.key) + boxWidth / 2)
            .attr("y1", d => y(d.value.min))
            .attr("y2", d => y(d.value.min))
            .attr("stroke", "black");

        svg.selectAll(".max")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "max")
            .attr("x1", d => x(d.key) - boxWidth / 2)
            .attr("x2", d => x(d.key) + boxWidth / 2)
            .attr("y1", d => y(d.value.max))
            .attr("y2", d => y(d.value.max))
            .attr("stroke", "black");
    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
}
