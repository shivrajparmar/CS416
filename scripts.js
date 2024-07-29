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

function createAnnotations(svg, annotations) {
    const type = d3.annotationLabel;

    const makeAnnotations = d3.annotation()
        .editMode(false)
        .notePadding(15)
        .type(type)
        .accessors({
            x: d => d.x,
            y: d => d.y
        })
        .annotations(annotations);

    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
}

function loadPage(page) {
    fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
            if (page === 'page1.html') {
                loadBoxPlotByBedrooms();
            } else if (page === 'page2.html') {
                loadBoxPlotByBathrooms();
            } else if (page === 'page3.html') {
                loadCityPriceComparison();
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
    const margin = { top: 50, right: 30, bottom: 60, left: 70 };

    const container = d3.select("#chart1");

    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    container.append("div")
        .attr("class", "hover-instruction")
        .style("position", "absolute")
        .style("top", "500px")
        .style("left", (width + margin.left + 50) + "px")
        .style("width", "200px")
        .style("padding", "10px")
        .style("background-color", "#f9f9a9")
        .style("border", "1px solid #333")
        .style("border-radius", "5px")
        .style("font-size", "18px")
        .style("color", "#333")
        .text("Hover over a box to see median values and click for more details!");

    container.append("div")
        .attr("class", "text-explanation")
        .style("position", "absolute")
        .style("top", (height + margin.top + 200) + "px")
        .style("left", "1050px")
        .style("font-size", "18px")
        .style("color", "#333")
        .style("padding", "10px")
        .style("background-color", "#f9f9a9")
        .style("border", "1px solid #333")
        .style("border-radius", "5px")
        .style("font-weight", "bold")
        .style("display", "inline-block")
        .text("Overall, house prices generally increase with the number of bedrooms.");

    d3.csv("USA Housing Dataset.csv").then(data => {
        data.forEach(d => {
            d.price = +d.price;
            d.bedrooms = +d.bedrooms;
        });

        const bedrooms = [...new Set(data.map(d => d.bedrooms))].sort(d3.ascending);

        const x = d3.scaleBand()
            .domain(bedrooms)
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.price)])
            .nice()
            .range([height - margin.top - margin.bottom, 0]);

        const boxData = Array.from(d3.group(data, d => d.bedrooms), ([key, values]) => {
            const sortedValues = values.map(d => d.price).sort(d3.ascending);
            const q1 = d3.quantile(sortedValues, 0.25);
            const median = d3.quantile(sortedValues, 0.5);
            const q3 = d3.quantile(sortedValues, 0.75);
            const interQuantileRange = q3 - q1;
            const min = d3.min(sortedValues);
            const max = d3.max(sortedValues);
            return { key, q1, median, q3, interQuantileRange, min, max, values };
        });

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d3.format("$.2s")));

        const boxWidth = x.bandwidth() * 0.6;

        svg.selectAll(".box")
            .data(boxData)
            .enter()
            .append("rect")
            .attr("class", "box")
            .attr("x", d => x(d.key) + x.bandwidth() / 2 - boxWidth / 2)
            .attr("y", d => y(d.q3))
            .attr("height", d => y(d.q1) - y(d.q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#69b3a2")
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "#ffcc00");
                const tooltip = svg.append("text")
                    .attr("class", "tooltip")
                    .attr("x", x(d.key) + x.bandwidth() / 2)
                    .attr("y", y(d.q3) - 10)
                    .attr("text-anchor", "middle")
                    .text(`Median: ${d3.format("$.2s")(d.median)}`);
            })
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", "#69b3a2");
                svg.selectAll(".tooltip").remove();
            })
            .on("click", function(event, d) {
                showDetailedView(d, "Bedrooms");
            });

        svg.selectAll(".median")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "median")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2 - boxWidth / 2)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2 + boxWidth / 2)
            .attr("y1", d => y(d.median))
            .attr("y2", d => y(d.median))
            .attr("stroke", "black");

        svg.selectAll(".min")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "min")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2)
            .attr("y1", d => y(d.min))
            .attr("y2", d => y(d.q1))
            .attr("stroke", "black");

        svg.selectAll(".max")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "max")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2)
            .attr("y1", d => y(d.q3))
            .attr("y2", d => y(d.max))
            .attr("stroke", "black");

        svg.selectAll(".whisker-min")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "whisker-min")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2 - boxWidth / 4)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2 + boxWidth / 4)
            .attr("y1", d => y(d.min))
            .attr("y2", d => y(d.min))
            .attr("stroke", "black");

        svg.selectAll(".whisker-max")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "whisker-max")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2 - boxWidth / 4)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2 + boxWidth / 4)
            .attr("y1", d => y(d.max))
            .attr("y2", d => y(d.max))
            .attr("stroke", "black");

        // Add x-axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", (width - margin.left - margin.right) / 2)
            .attr("y", height - margin.top - margin.bottom + 50)
            .text("Number of Bedrooms");

        // Add y-axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height - margin.top - margin.bottom) / 2)
            .attr("y", -margin.left + 20)
            .text("Price (USD)");
        
        // Add overall title
        svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", -20)
        .text("Distribution of House Prices by Number of Bedrooms");

        // Add Annotations
        const type = d3.annotationLabel;

        const annotations = [
            {
                note: {
                    label: "Highest price of $27M occurs at 3 bedrooms",
                    bgPadding: 20,
                    title: "Peak Price"
                },
                data: { bedrooms: 3, price: d3.max(data.filter(d => d.bedrooms === 3), d => d.price) },
                dy: 0,  // Adjusted dy to move the annotation down
                dx: 100,   // Adjusted dx to move the annotation to the right
                subject: { radius: 10 }
            }
        ];

        const makeAnnotations = d3.annotation()
            .editMode(true)
            .notePadding(15)
            .type(type)
            .accessors({
                x: d => x(d.bedrooms) + x.bandwidth() / 2,
                y: d => y(d.price)
            })
            .annotations(annotations);

        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
}

function loadBoxPlotByBathrooms() {
    const width = 960;
    const height = 500;
    const margin = { top: 50, right: 30, bottom: 60, left: 70 };

    const container = d3.select("#chart2");

    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add the hover instruction
    container.append("div")
        .attr("class", "hover-instruction")
        .style("position", "absolute")
        .style("top", "500px")
        .style("left", (width + margin.left + 50) + "px")
        .style("width", "200px")
        .style("padding", "10px")
        .style("background-color", "#f9f9a9")
        .style("border", "1px solid #333")
        .style("border-radius", "5px")
        .style("font-size", "18px")
        .style("color", "#333")
        .text("Hover over a box to see median values and click for more details!");
    
    container.append("div")
    .attr("class", "text-explanation")
    .style("position", "absolute")
    .style("top", (height + margin.top + 200) + "px")
    .style("left", "1050px")
    .style("font-size", "18px")
    .style("color", "#333")
    .style("padding", "10px")
    .style("background-color", "#f9f9a9")
    .style("border", "1px solid #333")
    .style("border-radius", "5px")
    .style("font-weight", "bold")
    .style("display", "inline-block")
    .text("Overall, house prices generally increase with the number of bathrooms.");

    d3.csv("USA Housing Dataset.csv").then(data => {
        data.forEach(d => {
            d.price = +d.price;
            d.bathrooms = +d.bathrooms;
        });

        const bathrooms = [...new Set(data.map(d => d.bathrooms))].sort(d3.ascending);

        const x = d3.scaleBand()
            .domain(bathrooms)
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.price)])
            .nice()
            .range([height - margin.top - margin.bottom, 0]);

        const boxData = Array.from(d3.group(data, d => d.bathrooms), ([key, values]) => {
            const sortedValues = values.map(d => d.price).sort(d3.ascending);
            const q1 = d3.quantile(sortedValues, 0.25);
            const median = d3.quantile(sortedValues, 0.5);
            const q3 = d3.quantile(sortedValues, 0.75);
            const interQuantileRange = q3 - q1;
            const min = d3.min(sortedValues);
            const max = d3.max(sortedValues);
            return { key, q1, median, q3, interQuantileRange, min, max, values };
        });

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.format(".2f")));

        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d3.format("$.2s")));

        const boxWidth = x.bandwidth() * 0.6;

        svg.selectAll(".box")
            .data(boxData)
            .enter()
            .append("rect")
            .attr("class", "box")
            .attr("x", d => x(d.key) + x.bandwidth() / 2 - boxWidth / 2)
            .attr("y", d => y(d.q3))
            .attr("height", d => y(d.q1) - y(d.q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#69b3a2")
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "#ffcc00");
                const tooltip = svg.append("text")
                    .attr("class", "tooltip")
                    .attr("x", x(d.key) + x.bandwidth() / 2)
                    .attr("y", y(d.q3) - 10)
                    .attr("text-anchor", "middle")
                    .text(`Median: ${d3.format("$.2s")(d.median)}`);
            })
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", "#69b3a2");
                svg.selectAll(".tooltip").remove();
            })
            .on("click", function(event, d) {
                showDetailedView(d, "Bathrooms");
            });

        svg.selectAll(".median")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "median")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2 - boxWidth / 2)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2 + boxWidth / 2)
            .attr("y1", d => y(d.median))
            .attr("y2", d => y(d.median))
            .attr("stroke", "black");

        svg.selectAll(".min")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "min")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2)
            .attr("y1", d => y(d.min))
            .attr("y2", d => y(d.q1))
            .attr("stroke", "black");

        svg.selectAll(".max")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "max")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2)
            .attr("y1", d => y(d.q3))
            .attr("y2", d => y(d.max))
            .attr("stroke", "black");

        svg.selectAll(".whisker-min")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "whisker-min")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2 - boxWidth / 4)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2 + boxWidth / 4)
            .attr("y1", d => y(d.min))
            .attr("y2", d => y(d.min))
            .attr("stroke", "black");

        svg.selectAll(".whisker-max")
            .data(boxData)
            .enter()
            .append("line")
            .attr("class", "whisker-max")
            .attr("x1", d => x(d.key) + x.bandwidth() / 2 - boxWidth / 4)
            .attr("x2", d => x(d.key) + x.bandwidth() / 2 + boxWidth / 4)
            .attr("y1", d => y(d.max))
            .attr("y2", d => y(d.max))
            .attr("stroke", "black");

        // Add x-axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", (width - margin.left - margin.right) / 2)
            .attr("y", height - margin.top - margin.bottom + 50)
            .text("Number of Bathrooms");

        // Add y-axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height - margin.top - margin.bottom) / 2)
            .attr("y", -margin.left + 20)
            .text("Price (USD)");

        // Add overall title
        svg.append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .attr("x", (width - margin.left - margin.right) / 2)
            .attr("y", -20)
            .text("Distribution of House Prices by Number of Bathrooms");

        // Find the highest price and the corresponding number of bathrooms
        const highestPriceData = data.reduce((max, d) => d.price > max.price ? d : max, data[0]);

        // Add Annotations
        const type = d3.annotationLabel;

        const annotations = [
            {
                note: {
                    label: `Highest price of $27M occurs at ${highestPriceData.bathrooms} bathrooms`,
                    bgPadding: 20,
                    title: "Peak Price"
                },
                data: { bathrooms: highestPriceData.bathrooms, price: highestPriceData.price },
                dy: 0,
                dx: 100,
                subject: { radius: 10 }
            }
            
        ];

        const makeAnnotations = d3.annotation()
            .editMode(true)
            .notePadding(15)
            .type(type)
            .accessors({
                x: d => x(d.bathrooms) + x.bandwidth() / 2,
                y: d => y(d.price)
            })
            .annotations(annotations);

        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
}

function showDetailedView(data, type) {
    // Calculate the average price
    const avgPrice = d3.mean(data.values, d => d.price);

    // Clear previous detailed view if any
    d3.select("#detailedView").remove();

    // Create a new detailed view container
    const detailedView = d3.select("body").append("div")
    .attr("id", "detailedView")
    .style("position", "absolute")
    .style("top", "500px")
    .style("right", "450px") // Change to right side
    .style("width", "300px")
    .style("height", "300px")
    .style("background-color", "#fff")
    .style("border", "1px solid #000")
    .style("padding", "10px")
    .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.5)");

    detailedView.append("h3").text(`Detailed View for ${data.key} bathrooms`);

    detailedView.append("p").text(`Number of Houses: ${data.values.length}`);
    detailedView.append("p").text(`Median Price: ${d3.format("$.2s")(data.median)}`);
    detailedView.append("p").text(`Average Price: ${d3.format("$.2s")(avgPrice)}`);
    detailedView.append("p").text(`Max Price: ${d3.format("$.2s")(data.max)}`);

    // Close button for detailed view
    detailedView.append("button")
        .text("Close")
        .on("click", () => detailedView.remove());
}


// New Function for City Price Comparison
function loadCityPriceComparison() {
    const width = 960;
    const height = 500;
    const margin = { top: 50, right: 30, bottom: 120, left: 70 }; // Increased bottom margin for rotated text

    const container = d3.select("#chart3");

    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    container.append("div")
        .attr("class", "hover-instruction")
        .style("position", "absolute")
        .style("top", "500px")
        .style("left", (width + margin.left + 50) + "px")
        .style("width", "200px")
        .style("padding", "10px")
        .style("background-color", "#f9f9a9")
        .style("border", "1px solid #333")
        .style("border-radius", "5px")
        .style("font-size", "18px")
        .style("color", "#333")
        .text("Hover over a bar to see median values and click for more details, including bedroom and bathroom info!");

    container.append("div")
        .attr("class", "text-explanation")
        .style("position", "absolute")
        .style("top", (height + margin.top + 200) + "px")
        .style("left", "1050px")
        .style("font-size", "18px")
        .style("color", "#333")
        .style("padding", "10px")
        .style("background-color", "#f9f9a9")
        .style("border", "1px solid #333")
        .style("border-radius", "5px")
        .style("font-weight", "bold")
        .style("display", "inline-block")
        .text("The cities with the highest average cost of housing in Washington include Medina, Clyde Hill, and Yarrow Point.");

    d3.csv("USA Housing Dataset.csv").then(data => {
        data.forEach(d => {
            d.price = +d.price;
            d.city = d.city;
        });

        // Find the highest price across the dataset
        const highestPrice = d3.max(data, d => d.price);

        const cities = [...new Set(data.map(d => d.city))].sort();

        const x = d3.scaleBand()
            .domain(cities)
            .range([0, width - margin.left - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, highestPrice]) // Use the highest price found
            .nice()
            .range([height - margin.top - margin.bottom, 0]);

        const barData = Array.from(d3.group(data, d => d.city), ([key, values]) => {
            const median = d3.median(values, d => d.price);
            const max = d3.max(values, d => d.price);
            const avg = d3.mean(values, d => d.price);
            return { key, median, max, avg, values };
        });

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d => d).tickSize(0).tickPadding(10))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("dy", "0.15em")
            .attr("transform", "rotate(-65)"); // Rotate text for better readability

        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d3.format("$.2s")));

        const barWidth = x.bandwidth() * 0.8;

        svg.selectAll(".bar")
            .data(barData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.key))
            .attr("y", d => y(d.median))
            .attr("height", d => height - margin.top - margin.bottom - y(d.median))
            .attr("width", barWidth)
            .attr("stroke", "black")
            .style("fill", "#69b3a2")
            .on("mouseover", function (event, d) {
                d3.select(this).style("fill", "#ffcc00");
                const tooltip = svg.append("text")
                    .attr("class", "tooltip")
                    .attr("x", x(d.key) + barWidth / 2)
                    .attr("y", y(d.median) - 10)
                    .attr("text-anchor", "middle")
                    .text(`Median: ${d3.format("$.2s")(d.median)}`);
            })
            .on("mouseout", function (event, d) {
                d3.select(this).style("fill", "#69b3a2");
                svg.selectAll(".tooltip").remove();
            })
            .on("click", function (event, d) {
                showDetailedView(d, "City");
            });

        // Add x-axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", (width - margin.left - margin.right) / 2)
            .attr("y", height - margin.top - margin.bottom + 80) // Adjusted for rotated text
            .text("City");

        // Add y-axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height - margin.top - margin.bottom) / 2)
            .attr("y", -margin.left + 20)
            .text("Average Price (USD)");

        // Add overall title
        svg.append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .attr("x", (width - margin.left - margin.right) / 2)
            .attr("y", -20)
            .text("Comparison of House Prices by City");

        // Find the city with the highest average price
        const mostExpensiveCity = d3.max(barData, d => d.avg);
        const mostExpensiveCityData = barData.find(d => d.avg === mostExpensiveCity);

        // Add Annotations
        const type = d3.annotationLabel;

        const annotations = [
            {
                note: {
                    label: `Most Expensive City: ${mostExpensiveCityData.key} ($${d3.format(".2s")(mostExpensiveCityData.avg)})`,
                    bgPadding: 20,
                    title: "Highest Average Price"
                },
                data: { key: mostExpensiveCityData.key, avg: mostExpensiveCityData.avg },
                dy: -50, // Adjusted dy to move the annotation up
                dx: 0, // Adjusted dx to position the annotation correctly
                subject: { radius: 10 }
            }
        ];

        const makeAnnotations = d3.annotation()
            .editMode(false)
            .notePadding(15)
            .type(type)
            .accessors({
                x: d => x(d.key) + x.bandwidth() / 2,
                y: d => y(d.avg)
            })
            .annotations(annotations);

        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
}

function showDetailedView(data, type) {
    // Calculate the average price
    const avgPrice = d3.mean(data.values, d => d.price);
    // Calculate the average number of bedrooms and bathrooms if the type is City
    let avgBedrooms, avgBathrooms;
    if (type === "City") {
        avgBedrooms = d3.mean(data.values, d => d.bedrooms);
        avgBathrooms = d3.mean(data.values, d => d.bathrooms);
    }

    // Clear previous detailed view if any
    d3.select("#detailedView").remove();

    // Create a new detailed view container
    const detailedView = d3.select("body").append("div")
        .attr("id", "detailedView")
        .style("position", "absolute")
        .style("top", "400px")
        .style("right", "450px") // Change to right side
        .style("width", "300px")
        .style("height", "auto")
        .style("background-color", "#fff")
        .style("border", "1px solid #000")
        .style("padding", "10px")
        .style("box-shadow", "2px 2px 10px rgba(0,0,0,0.5)");

    detailedView.append("h3").text(`Detailed View for ${data.key}`);

    detailedView.append("p").text(`Number of Houses: ${data.values.length}`);
    detailedView.append("p").text(`Median Price: ${d3.format("$.2s")(data.median)}`);
    detailedView.append("p").text(`Average Price: ${d3.format("$.2s")(avgPrice)}`);
    detailedView.append("p").text(`Max Price: ${d3.format("$.2s")(data.max)}`);
    
    // Add average number of bedrooms and bathrooms if the type is City
    if (type === "City") {
        detailedView.append("p").text(`Average Bedrooms: ${avgBedrooms.toFixed(2)}`);
        detailedView.append("p").text(`Average Bathrooms: ${avgBathrooms.toFixed(2)}`);
    }

    // Close button for detailed view
    detailedView.append("button")
        .text("Close")
        .on("click", () => detailedView.remove());
}


