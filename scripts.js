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
                loadMap(); // Function to load the map visualization
            } else if (page === 'page2.html') {
                loadBarChart(); // Function to load the bar chart visualization
            } else if (page === 'page3.html') {
                loadLineChart(); // Function to load the line chart visualization
            }
        });
}

function updateNavButtons() {
    document.getElementById('prevBtn').disabled = (currentPageIndex === 0);
    document.getElementById('nextBtn').disabled = (currentPageIndex === pages.length - 1);
}

function loadMap() {
    const width = 960;
    const height = 500;

    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .scale(150)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Load the CSV data
    d3.csv("Literacy rates (no pw2).csv").then(data => {
        // Aggregate literacy rates by country
        const literacyData = {};
        data.forEach(d => {
            const country = d.Country;
            if (!literacyData[country]) {
                literacyData[country] = [];
            }
            literacyData[country].push(+d['Literacy rate']);
        });

        // Compute average literacy rate for each country
        for (const country in literacyData) {
            literacyData[country] = d3.mean(literacyData[country]);
        }

        // Load and display the world map
        d3.json("https://d3js.org/world-110m.v1.json").then(world => {
            svg.append("g")
                .selectAll("path")
                .data(topojson.feature(world, world.objects.countries).features)
                .enter().append("path")
                .attr("d", path)
                .attr("class", "country")
                .style("fill", function(d) {
                    const literacyRate = literacyData[d.properties.name];
                    return literacyRate ? d3.interpolateBlues(literacyRate) : '#ccc';
                })
                .on("mouseover", function(event, d) {
                    d3.select(this).style("stroke", "black");
                    const [x, y] = d3.pointer(event);
                    d3.select("#map").append("div")
                        .attr("class", "tooltip")
                        .style("left", `${x + 5}px`)
                        .style("top", `${y + 5}px`)
                        .text(`Country: ${d.properties.name}\nLiteracy Rate: ${literacyData[d.properties.name] ? literacyData[d.properties.name].toFixed(2) : 'N/A'}`);
                })
                .on("mouseout", function() {
                    d3.select(this).style("stroke", null);
                    d3.select(".tooltip").remove();
                });

            // Highlight regions with highest and lowest literacy rates
            // (Add annotations as needed)
        });
    });
}
