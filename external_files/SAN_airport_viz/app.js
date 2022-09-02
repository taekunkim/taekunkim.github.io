//https://www.heartinternet.uk/blog/create-beautiful-test-driven-data-visualisations-with-d3-js/

const HEIGHT_FACTOR = 2 / 3 // keep width of plot 2/3 of screen width
const WIDTH_FACTOR = 4 / 3 // fix plot size ratio 4:3 

const PLOT_HEIGHT = window.innerHeight * HEIGHT_FACTOR
const PLOT_WIDTH = PLOT_HEIGHT * WIDTH_FACTOR
const PLOT_MARGIN = {
    top: 50, bottom: 70, left: 50, right: 50
}
const TITLE_SIZE = 15

const BLUE = "#5088bd"
const GRAY = "#bebebe"

function finalProject() {
    var filePath = "./data/data.csv"
    heatMap(filePath)
    choropleth(filePath)
    barPlot(filePath)
    scatterPlot(filePath)
    forcelink(filePath)
}

var scatterPlot = function (filePath) {

    const radius = 3

    var rowConverter = function (d) {
        return {
            TravelDistance: parseFloat(d["Destination Airport Distance"]),
            DelayMins: parseFloat(d["Departure delay (Minutes)"]),
        }
    }

    //reading data
    d3.csv(filePath, rowConverter).then(data => {

        data = d3.filter(data, d => d.DelayMins > 0 && d.DelayMins <= 180)

        var svg = d3.select("#scatterPlot")
            .append("svg")
            .attr("width", PLOT_WIDTH + PLOT_MARGIN.left + PLOT_MARGIN.right)
            .attr("height", PLOT_HEIGHT + PLOT_MARGIN.bottom + PLOT_MARGIN.top)
            .append("g")
            .attr("transform",
                "translate(" + PLOT_MARGIN.left + "," + PLOT_MARGIN.top + ")")

        // x axis
        var x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.TravelDistance)])
            .range([0, PLOT_WIDTH])
        svg.append("g")
            .attr("transform", "translate(0," + PLOT_HEIGHT + ")")
            .call(d3.axisBottom(x))

        // y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.DelayMins)])
            .range([PLOT_HEIGHT, PLOT_MARGIN.top])
        svg.append("g")
            .call(d3.axisLeft(y))

        // title
        var title = svg.append("text")
            .attr("x", PLOT_WIDTH / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-weight", 900)
            .style("font-size", TITLE_SIZE)
            .style("text-decoration", "underline")
            .text("Delay Time VS Flight Distance")

        // y-axis title
        svg.append("text")
            .attr("class", "axis_title")
            .attr("transform", "rotate(-90)")
            .attr("x", -1 * PLOT_HEIGHT / 2)
            .attr("y", -1 * PLOT_MARGIN.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Delay Time (mins)")

        // x-axis title
        svg.append("text")
            .attr("class", "axis_title")
            .attr("x", PLOT_WIDTH / 2)
            .attr("y", (PLOT_HEIGHT + 30))
            .style("text-anchor", "middle")
            .attr("dy", "1em")
            .text("Flight Distance (Km)")

        // dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.TravelDistance))
            .attr("cy", d => y(d.DelayMins))
            .attr("r", radius)
            .style("fill", BLUE)
            .style("opacity", 0.08)

    })
}

var barPlot = function (filePath) {

    var rowConverter = function (d) {
        return {
            Airline: d["Airline"],
            DelayMins: parseFloat(d["Departure delay (Minutes)"]),
            CarrierDelay: parseFloat(d["Delay Carrier (Minutes)"]),
            WeatherDelay: parseFloat(d["Delay Weather (Minutes)"]),
            AviationSystemDelay: parseFloat(d["Delay National Aviation System (Minutes)"]),
            SecurityDelay: parseFloat(d["Delay Security (Minutes)"]),
            LateArrivalDelay: parseFloat(d["Delay Late Aircraft Arrival (Minutes)"])
        }
    }

    //reading data
    d3.csv(filePath, rowConverter).then(data => {
        airlines = d3.map(data, ({ Airline, }) => (Airline))

        delayCause = "DelayMins" //getting the value of selected radio button
        data_to_plot = d3.flatRollup(data, v => d3.mean(v, v => (v[delayCause] > 0) * 100), d => d.Airline)
        max_val = d3.max(d3.map(data_to_plot, ([Airline, Value]) => (Value)))

        var svg = d3.select("#barPlot")
            .append("svg")
            .attr("width", PLOT_WIDTH + PLOT_MARGIN.left + PLOT_MARGIN.right)
            .attr("height", PLOT_HEIGHT + PLOT_MARGIN.top + PLOT_MARGIN.bottom)
            .append("g")
            .attr("transform",
                "translate(" + PLOT_MARGIN.left + "," + PLOT_MARGIN.top + ")")

        // x axis
        var x = d3.scaleBand()
            .domain(airlines)
            .range([0, PLOT_WIDTH])
            .padding(0.3)

        svg.append("g")
            .attr("transform", "translate(0," + PLOT_HEIGHT + ")")
            .attr("class", "xAxis")
            .call(d3.axisBottom(x))

        // y axis
        var y = d3.scaleLinear()
            .domain([0, max_val])
            .range([PLOT_HEIGHT, PLOT_MARGIN.top])
        svg.append("g")
            .attr("class", "yAxis")
            .call(d3.axisLeft(y))

        // title
        var title = svg.append("text")
            .attr("x", PLOT_WIDTH / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-weight", 900)
            .style("font-size", TITLE_SIZE)
            .style("text-decoration", "underline")
            .text("Percentage of Delay per Airline")

        // y-axis title
        svg.append("text")
            .attr("class", "axis_title")
            .attr("transform", "rotate(-90)")
            .attr("x", -1 * PLOT_HEIGHT / 2)
            .attr("y", -1 * PLOT_MARGIN.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Percentage of Delay per Airline")

        // x-axis title
        svg.append("text")
            .attr("class", "axis_title")
            .attr("x", PLOT_WIDTH / 2)
            .attr("y", (PLOT_HEIGHT + 30))
            .style("text-anchor", "middle")
            .attr("dy", "1em")
            .text("Cause of Delay")

        // bars
        svg.append('g')
            .selectAll('rect')
            .data(data_to_plot)
            .enter()
            .append('rect')
            .attr('x', (d, i) => x(d[0]))
            .attr('y', (d, i) => y(d[1]))
            .attr('height', d => y(0) - y(d[1]))
            .attr('width', x.bandwidth())
            .style("fill", BLUE)

        // change plot
        var radio = d3.select('#radioBar')
            .attr("name", "delayCause")
            .on("change", function (d) {
                // update data
                delayCause = d.target.value //getting the value of selected radio button
                data_to_plot = d3.flatRollup(data, v => d3.mean(v, v => (v[delayCause] > 0) * 100), d => d.Airline)
                max_val = d3.max(d3.map(data_to_plot, ([Airline, Value]) => (Value)))

                // update y axis
                var y = d3.scaleLinear()
                    .domain([0, max_val])
                    .range([PLOT_HEIGHT, PLOT_MARGIN.top])

                yAxis = d3.axisLeft(y)

                d3.selectAll('.yAxis')
                    .transition("yAxis").duration(1000)
                    .call(yAxis)

                // update bars
                rects = d3.selectAll("rect")
                    .data(data_to_plot)

                rects
                    .enter()
                    .append('rect')
                    .merge(rects)
                    .transition("rects")
                    .attr('x', (d, i) => x(d[0]))
                    .attr('y', (d, i) => y(d[1]))
                    .attr('height', d => y(0) - y(d[1]))
                    .attr('width', x.bandwidth())
                    .style("fill", BLUE)
            })
    })
}

var heatMap = function (filePath) {

    var rowConverter = function (d) {
        return {
            Delayed: (parseFloat(d["Departure delay (Minutes)"]) > 0) * 1,
            DepartureTime: parseFloat(d["Scheduled departure time"].split(":")[0]),
            DepartureDay: d["Day of the Week"]
        }
    }

    //reading data
    d3.csv(filePath, rowConverter).then(data => {
        // get unique departure times
        times = []
        data.forEach(item => {
            time = item.DepartureTime
            if (!times.includes(time)) times.push(time)
        })
        times = times.sort((a, b) => a - b)

        // days of the week
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        // aggregate data
        data = d3.flatRollup(data, v => d3.mean(v, v => v.Delayed), d => d.DepartureDay, d => d.DepartureTime)
        data = d3.map(data, ([Day, Time, Ratio]) => ({ Day, Time, Ratio }))

        var svg = d3.select("#heatmap")
            .append("svg")
            .attr("width", PLOT_WIDTH + PLOT_MARGIN.left + PLOT_MARGIN.right)
            .attr("height", PLOT_HEIGHT + PLOT_MARGIN.top + PLOT_MARGIN.bottom)
            .append("g")
            .attr("transform",
                "translate(" + PLOT_MARGIN.left + "," + PLOT_MARGIN.top + ")")

        // x axis
        var x = d3.scaleBand()
            .domain(days)
            .range([0, PLOT_WIDTH])

        svg.append("g")
            .attr("transform", "translate(0," + PLOT_HEIGHT + ")")
            .attr("class", "xAxis")
            .call(d3.axisBottom(x))

        // y axis
        var y = d3.scaleBand()
            .domain(times)
            .range([PLOT_MARGIN.top, PLOT_HEIGHT])

        svg.append("g")
            .attr("class", "heatmap_yAxis")
            .call(d3.axisLeft(y))
            .append("text")

        // title
        var title = svg.append("text")
            .attr("x", PLOT_WIDTH / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-weight", 900)
            .style("font-size", TITLE_SIZE)
            .style("text-decoration", "underline")
            .text("Percentage of Delay per Time of the Week")

        // y-axis title
        svg.append("text")
            .attr("class", "axis_title")
            .attr("transform", "rotate(-90)")
            .attr("x", -1 * PLOT_HEIGHT / 2)
            .attr("y", -1 * PLOT_MARGIN.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Time of the Day")

        // x-axis title
        svg.append("text")
            .attr("class", "axis_title")
            .attr("x", PLOT_WIDTH / 2)
            .attr("y", (PLOT_HEIGHT + 30))
            .style("text-anchor", "middle")
            .attr("dy", "1em")
            .text("Day of the Week")

        // define color scheme
        max_val = d3.max(data, d => d.Ratio)

        var colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([0, max_val])

        // define tooltip
        var tooltip = d3.select("#heatmap")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")

        // rectangles
        svg.selectAll()
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "heatRect")
            .attr("x", d => x(d.Day))
            .attr("y", d => y(d.Time))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => colorScale(d.Ratio))
            .on("mouseover", function (e, d) {
                tooltip.transition("tooltip").duration(0).style("opacity", 0)
            })
            .on("mousemove", function (e, d) {
                tooltip
                    .transition()
                    .duration(0)

                // tooltip info
                day = d.Day
                time = d.Time
                text = "<b>" + day + " " + time + ":00</b>"

                tooltip
                    .html("<p style='font-size:10'>" + text + "<br>" + Math.ceil(d.Ratio * 100) + "% delayed<\p>")
                    .style("top", (e.pageY - 10) + "px")
                    .style("left", (e.pageX + 10) + "px")
                    .style("height", y.bandwidth() * 1.5)
                    .style("font-size", 10)
                    .style("font-family", "Arial")
                    .style("opacity", 1)

                // fade out colors of all states
                d3.selectAll(".heatRect")
                    .transition()
                    .duration(0)
                    .style("opacity", .5)

                // set opacity of selected state
                d3.select(this)
                    .transition()
                    .duration(0)
                    .style("opacity", 1)
            })
            .on("mouseout", function (e, d) {
                tooltip
                    .transition()
                    .duration(20)
                    .style("opacity", 0)

                d3.selectAll(".heatRect")
                    .transition()
                    .duration(0)
                    .style("opacity", 1)
            })



    })
}

var choropleth = function (filePath) {
    var rowConverter = function (d) {
        return {
            Country: d["Destination Airport Country"],
            State: d["Destination Airport State"],
            Delayed: (parseFloat(d["Departure delay (Minutes)"]) > 0) * 1
        }
    }

    //reading data
    d3.csv(filePath, rowConverter).then(data => {
        // State Symbol dictionary for conversion of names and symbols.
        var stateSym = {
            'Arizona': 'AZ',
            'Alabama': 'AL',
            'Alaska': 'AK',
            'Arkansas': 'AR',
            'California': 'CA',
            'Colorado': 'CO',
            'Connecticut': 'CT',
            'District of Columbia': 'DC',
            'Delaware': 'DE',
            'Florida': 'FL',
            'Georgia': 'GA',
            'Hawaii': 'HI',
            'Idaho': 'ID',
            'Illinois': 'IL',
            'Indiana': 'IN',
            'Iowa': 'IA',
            'Kansas': 'KS',
            'Kentucky': 'KY',
            'Louisiana': 'LA',
            'Maine': 'ME',
            'Maryland': 'MD',
            'Massachusetts': 'MA',
            'Michigan': 'MI',
            'Minnesota': 'MN',
            'Mississippi': 'MS',
            'Missouri': 'MO',
            'Montana': 'MT',
            'Nebraska': 'NE',
            'Nevada': 'NV',
            'New Hampshire': 'NH',
            'New Jersey': 'NJ',
            'New Mexico': 'NM',
            'New York': 'NY',
            'North Carolina': 'NC',
            'North Dakota': 'ND',
            'Ohio': 'OH',
            'Oklahoma': 'OK',
            'Oregon': 'OR',
            'Pennsylvania': 'PA',
            'Rhode Island': 'RI',
            'South Carolina': 'SC',
            'South Dakota': 'SD',
            'Tennessee': 'TN',
            'Texas': 'TX',
            'Utah': 'UT',
            'Vermont': 'VT',
            'Virginia': 'VA',
            'Washington': 'WA',
            'West Virginia': 'WV',
            'Wisconsin': 'WI',
            'Wyoming': 'WY'
        }

        // manipulate data
        data = d3.filter(data, d => d.Country == "US")
        data = d3.rollup(data, v => d3.mean(v, v => v.Delayed), d => d.State)

        // set color scale
        scale = [0.1, 0.2, 0.3, 0.4, 0.5]
        var colorScale = d3.scaleThreshold()
            .domain(scale)
            .range(d3.schemeBlues[6])

        // define tooltip
        var tooltip = d3.select("#choropleth")
            .append("div")
            .style("opacity", 1)
            .attr("class", "tooltip")
            .style("background-color", "white")

        // define mouse layover animation
        let mouseOver = function (e, d) {

            // fade out colors of all states
            d3.selectAll(".Country")
                .transition()
                .duration(80)
                .style("opacity", .7)

            // set opacity of selected state
            d3.select(this)
                .transition()
                .duration(80)
                .style("opacity", 1)

            // set up tooltip values
            stateFull = d.properties.name
            state = stateSym[stateFull]
            ratio = data.get(state)
            if (ratio == undefined) text = "<b>" + stateFull + "</b><br>No flights to this state"
            else text = "<b>" + stateFull + "</b><br>" + Math.ceil(ratio * 100) + "% of flights delayed"

            // add tooltip
            tooltip
                .transition()
                .duration(0)
            tooltip
                .html(text)
                .style("top", (e.pageY - 20) + "px")
                .style("left", (e.pageX + 20) + "px")
                .style("font-size", 12)
                .style("font-family", "Arial")
                .style("opacity", 1)
        }

        let mouseOut = function (d) {

            d3.selectAll(".Country")
                .transition()
                .duration(80)
                .style("opacity", 1)

            // remove toolip
            tooltip
                .transition()
                .duration(80)
                .style("opacity", 0)
        }

        // define map objects
        const projection = d3.geoAlbersUsa()
            .scale(700)
            .translate([PLOT_WIDTH / 2, PLOT_HEIGHT / 2.5])

        const pathgeo = d3.geoPath().projection(projection)

        const map = d3.json("./us-states.json")

        // define canvas
        var svg = d3.select("#choropleth")
            .append("svg")
            .attr("width", PLOT_WIDTH + PLOT_MARGIN.left + PLOT_MARGIN.right)
            .attr("height", PLOT_HEIGHT)
            .append("g")
            .attr("transform",
                "translate(" + PLOT_MARGIN.left + "," + PLOT_MARGIN.top + ")")

        var title = svg.append("text")
            .attr("x", PLOT_WIDTH / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-weight", 900)
            .style("font-size", TITLE_SIZE)
            .style("text-decoration", "underline")
            .text("Percentage of Delay per Destination State")

        // plot map
        map.then(map => {
            svg.selectAll("path")
                .data(map.features)
                .enter()
                .append("path")
                .attr("d", pathgeo)
                .attr("fill", function (d) {
                    state = stateSym[d.properties.name]
                    ratio = data.get(state)
                    if (ratio == undefined) {
                        return GRAY
                    }
                    return colorScale(ratio)
                })
                .style("stroke", "white")
                .style("stroke-width", "0.3")
                .attr("class", function (d) { return "Country" })
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut)
        })

        // legend
        legend_radius = 8
        legend_scale = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5]
        svg.selectAll(".legend_color")
            .data(legend_scale)
            .enter()
            .append("circle")
            .attr("class", "legend_color")
            .attr("cx", 0)
            .attr("cy", (d, i) => PLOT_HEIGHT * 0.2 + i * 0.05 * PLOT_HEIGHT)
            .attr("r", legend_radius)
            .attr("fill", d => { if (d != 0.0) return colorScale(d); else return GRAY })

        svg.selectAll(".legend_label")
            .data(legend_scale)
            .enter()
            .append("text")
            .attr("class", "legend_label")
            .attr("x", 0 + legend_radius * 2)
            .attr("y", (d, i) => PLOT_HEIGHT * 0.2 + i * 0.05 * PLOT_HEIGHT + legend_radius / 4)
            .attr("color", "black")
            .style("font-size", legend_radius * 1.5)
            .text((d, i) => {
                if (i == 0) return "No Flights"
                if (i == 1) return "< " + d * 100 + "%"
                if (i == 5) return d * 100 + "%" + " <"
                else return d * 100 + "%" + " <"
            })

    })
}

var forcelink = function (filePath) {

    var rowConverter = function (d) {
        return {
            Country: d["Destination Airport Country"],
            State: d["Destination Airport State"],
            Delayed: (parseFloat(d["Departure delay (Minutes)"]) > 0) * 1,
            Distance: (parseFloat(d["Destination Airport Distance"])),
            Airport: d["Destination Airport Code"]
        }
    }

    //reading data
    d3.csv(filePath, rowConverter).then(data => {
        country_abbrev = { "US": "USA", "AR": "Argentina", "ID": "Indonesia", "CO": "Columbia", "MX": "Mexico", "AU": "Australia", "PG": "Papua New Guinea" }
        // add country name to state name -- CO can be a state and a country; needs to be distinguished
        for (i = 0; i < data.length; i++) {
            country = data[i]["Country"]
            state = data[i]["State"]
            data[i]["State"] = country + "_" + state
        }

        by_country = d3.rollup(data, v => d3.mean(v, v => v.Delayed), d => d.Country)
        countries = [...new Set(data.map(item => item.Country))] // countries = Array.from(country_data.keys().entries())

        by_state = d3.flatRollup(data, v => d3.mean(v, v => v.Delayed), d => d.State)
        by_state = d3.map(by_state, ([State, Ratio]) => ({ State, Ratio }))

        state_distance = d3.rollup(data, v => d3.mean(v, v => v.Distance), d => d.State)

        state_to_country_dict = {}
        data.forEach(item => {
            state = item.State
            country = item.Country
            state_to_country_dict[state] = country
        })

        // manipulate data for forcelink
        id = 0
        country_count = 1
        node_data = { "nodes": [], "links": [], "countries": [] }
        id_data = {}
        for (i = 0; i < by_state.length; i++) {
            state = by_state[i].State
            country = state_to_country_dict[state]

            // add country node
            if (node_data["countries"].includes(country) == false) {
                obj = { id: id, name: country, x: PLOT_WIDTH / countries.length * country_count, y: PLOT_HEIGHT / 2, ratio: by_country.get(country) }
                node_data["nodes"].push(obj)
                node_data["countries"].push(country)
                id_data[country] = id
                country_count += 1
                id += 1
            }

            // add state node
            ratio = by_state[i].Ratio
            obj = { id: id, name: state, country: country, x: 0, y: 0, ratio: ratio }
            node_data["nodes"].push(obj)
            id_data[state] = id
            id += 1

            // add link
            country_id = id_data[country]
            state_id = id_data[state]

            obj = { source: country_id, target: state_id, x: 0, y: 0, distance: state_distance.get(state) }
            node_data.links.push(obj)
        }

        // add San Diego node
        node_data["nodes"].push({ id: id, name: "San Diego", country: country, x: PLOT_WIDTH / 2, y: PLOT_HEIGHT / 2, ratio: 1 })

        // add link from countries to San Diego 
        for (i = 0; i < countries.length; i++) {
            country = countries[i]
            country_id = id_data[country]
            node_data["links"].push({ source: id, target: country_id, x: 0, y: 0, distance: 10 })
        }

        const radius = 25

        var svg = d3.select("#forcelink")
            .append("svg")
            .attr("width", (PLOT_WIDTH + PLOT_MARGIN.left + PLOT_MARGIN.right) * 1.3)
            .attr("height", (PLOT_HEIGHT + PLOT_MARGIN.top + PLOT_MARGIN.bottom) * 1.3)
            .append("g")
            .attr("transform",
                "translate(" + PLOT_MARGIN.left + "," + PLOT_MARGIN.top + ")")

        var title = svg.append("text")
            .attr("x", PLOT_WIDTH / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-weight", 900)
            .style("font-size", TITLE_SIZE)
            .style("text-decoration", "underline")
            .text("Delay Amount per Arrival State")

        var force = d3.forceSimulation(node_data.nodes)
            .force("charge", d3.forceManyBody().strength(10))
            .force("link", d3.forceLink(node_data.links).distance(d => 3).strength(3))
            .force("center", d3.forceCenter(PLOT_WIDTH / 2, PLOT_HEIGHT / 2))
            .force("collide", d3.forceCollide().strength(2).radius(d => d.ratio * 90))

        var links = svg.selectAll("line")
            .data(node_data.links)
            .enter()
            .append("line")
            .attr("stroke", "gray")
            .style("stroke-width", d => d.chem ** 4 / 100 ** 4 * radius)
            .style("opacity", d => d.chem ** 5 / 100 ** 5 * 1.2)

        var nodes = svg.selectAll("circle")
            .data(node_data.nodes)
            .enter()
            .append("circle")
            .style("fill", d => {
                if (d.name == "San Diego") return "#d15d59"
                else if (!d.name.includes("_")) return "#5ca27b"
                else return BLUE
            })

        var labels = svg.selectAll("node_label")
            .data(node_data.nodes)
            .enter()
            .append("text")
            .attr("class", "node_label")
            .attr("color", "red")
            .style("font-size", d => {
                if (d.name == "San Diego") return 40 / 3
                if (!d.name.includes("_")) return 30 / 3
                else return 20 / 3
            })
            .style("text-anchor", "middle")
            .style('alignment-baseline', 'top')
            .style("fill", "white")
            .text(d => {
                if (d.name == "San Diego") return d.name
                if (d.name.includes("_")) return d.name.split("_")[1]
                else return country_abbrev[d.name]
            })
            .attr("dx", 0)
            .attr("dy", 0)

        force.on("tick", function () {

            links.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            nodes.attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .attr("r", d => {
                    if (d.name == "San Diego") return 40
                    if (!d.name.includes("_")) return 30
                    else return d.ratio / 0.1 * 4.3
                });

            labels.attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y + radius / 6; })

        })

        // legend
        legend_radius = 8
        legend_colors = ["#d15d59", "#5ca27b", BLUE]
        legend_labels = ["Origin Airport", "Destination Country", "Destination State"]

        svg.selectAll(".legend_color")
            .data(legend_colors)
            .enter()
            .append("circle")
            .attr("class", "legend_color")
            .attr("cx", 0)
            .attr("cy", (d, i) => (PLOT_HEIGHT * 0.75) * 1.55 + i * 0.05 * PLOT_HEIGHT)
            .attr("r", legend_radius)
            .attr("fill", d => d)

        svg.selectAll(".legend_label")
            .data(legend_labels)
            .enter()
            .append("text")
            .attr("class", "legend_label")
            .attr("x", legend_radius * 2)
            .attr("y", (d, i) => (PLOT_HEIGHT * 0.75) * 1.55 + i * 0.05 * PLOT_HEIGHT + legend_radius / 3)
            .attr("color", "black")
            .style("font-size", legend_radius * 1.5)
            .text(d => d)

        svg.append("text")
            .attr("class", "axis_title")
            .attr("x", -9)
            .attr("y", PLOT_HEIGHT)
            .style("font-size", 13)
            .text("Size to Delay Percentage Guide")

        legend_sizes = [0.1, 0.2, 0.3, 0.4]

        svg.selectAll(".legend_size")
            .data(legend_sizes)
            .enter()
            .append("circle")
            .attr("class", "legend_color")
            .attr("cx", (d, i) => d * 43 + PLOT_WIDTH * 0.09 * i)
            .attr("cy", PLOT_HEIGHT * 1.07)
            .attr("r", d => d * 43)
            .attr("fill", "white")
            .attr("stroke", "black")

        svg.selectAll(".legend_size")
            .data(legend_sizes)
            .enter()
            .append("text")
            .attr("class", "legend_label")
            .attr("x", (d, i) => d * 43 * 2 + PLOT_WIDTH * 0.09 * i + PLOT_WIDTH * 0.005)
            .attr("y", PLOT_HEIGHT * 1.07 + legend_radius * 1.3 / 2)
            .attr("color", "black")
            .style("font-size", legend_radius * 1.3)
            .text(d => "" + d * 100 + "%")
    })
}