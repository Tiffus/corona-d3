class Graph {

    //Marge dans le graph
    margin = {
        top: 40,
        bottom: 30,
        left: 50,
        right: 0
    }

    graphWidth;
    graphHeight;

    svg;
    svgWidth;
    svgHeight;

    linesContainer;
    lines;

    svgYaxis;
    svgXaxis;

    valueLine;
    scaleX;
    scaleY;

    isLinear = true;
    state = "are confirmed cases";

    constructor(svg, svgWidth, svgHeight) {

        this.svg = svg;
        this.svgWidth = svgWidth;
        this.svgHeight = svgHeight;

        this.configureSVG(this.svg, this.svgWidth, this.svgHeight, this.margin);
    }


    configureSVG(svg, svgWidth, svgHeight, margin) {

        //taille du graph
        this.graphWidth = svgWidth - margin.left - margin.right;
        this.graphHeight = svgHeight - margin.top - margin.bottom;

        let container = svg.append("g")
            .attr("class", "graphContainer")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        this.svgXaxis = container.append("g")
            .attr("class", "svgXaxis")
            .attr("class", "xaxis")
            .attr("transform", `translate(0, ${this.graphHeight})`);

        this.svgYaxis = container.append("g")
            .attr("class", "svgYaxis")
            .attr("class", "yaxis");

        this.linesContainer = container.append("g")
            .attr("class", "linesContainer")
            .attr("fill", "none");
    }


    //Configure d3 pour l'affichage echelle etc
    configureGraph(dataParser, currentState, isUpdate) {

        //Définition des échelles pour les données
        this.scaleX = d3.scaleTime()
            .range([0, this.graphWidth])
            .domain(d3.extent(dataParser.cumulativeData.dates));

        //Choix de l'échelle
        if (this.isLinear) {
            this.scaleY = d3.scaleLinear()
                .range([this.graphHeight, 0])
                .domain([0, d3.max(dataParser.cumulativeData.series, d => d3.max(d[currentState]))]).nice();

            //Create axis
            this.svgYaxis.transition().duration(1000)
                .call(d3.axisLeft(this.scaleY).tickFormat(d3.format("")));
        } else {

            this.scaleY = d3.scaleLog().base(10)
                .range([this.graphHeight, 0])
                .domain([1, d3.max(dataParser.cumulativeData.series, d => d3.max(d[currentState]))]).clamp(true).nice();

            //Create axis
            this.svgYaxis.transition().duration(1000)
                .call(d3.axisLeft(this.scaleY).ticks(4).tickFormat(d3.format("")));
        }



        //Lignes horizontales
        this.svgYaxis.transition().duration(1000)
            .call(g => g.selectAll(".tick line")
                .attr("x2", this.graphWidth)
                .attr("stroke-opacity", 0.1));

        this.svgXaxis.call(d3.axisBottom(this.scaleX));

        //definition de la ligne en mappant x et y pour chaque serie
        //line va recevoir une data x et une data y pour chaque point
        //on les traite séparement dans la fonction x() et y()
        this.valueLine = d3.line()
            .curve(d3.curveBasis)
            .x((d, i) => this.scaleX(dataParser.cumulativeData.dates[i]))
            .y(d => this.scaleY(d));


        if (!isUpdate) {
            this.drawGraph(dataParser, currentState);
        } else {
            this.updateGraph(dataParser, currentState);
        }
    }


    //Dessine une première fois
    drawGraph(dataParser, currentState) {
        console.log("draw graph")

        //Pour chacun des pays
        dataParser.cumulativeData.series.forEach((country, i) => {
            this.linesContainer.selectAll(`.line-${i}`)
                .data([country[currentState]])
                .enter()
                .append("path")
                .attr("class", `line line-${i}`)
                .style("stroke", `hsl(${Math.random() * 360},100%,40%)`)
                .attr("d", this.valueLine)
                .attr("data-name", country.name)
                .attr("data-last", d => d[d.length - 1])
                .attr("data-id", i);
        })

        dataParser.cumulativeData.series.forEach((country, i) => {
            this.linesContainer.selectAll(`.text-${i}`)
                .data([country[currentState]])
                .enter()
                .append("text")
                .attr("class", `text text-${i}`)
                .attr("x", d => this.graphWidth)
                .attr("y", d => this.scaleY(d[d.length - 1]) - 5)
                .text(t => country.name)
        })
    }

    //Mise à jour du graphique
    updateGraph(dataParser, currentState) {

        //Pour chacun des pays
        dataParser.cumulativeData.series.forEach((country, i) => {
            //On trace la ligne en passant le tableau infected
            this.linesContainer
                .selectAll(`.line-${i}`)
                .data([country[currentState]])
                .attr("data-last", d => d[d.length - 1])
                .attr("d", this.valueLine);
            i++;
        })

        dataParser.cumulativeData.series.forEach((country, i) => {
            //On trace la ligne en passant le tableau infected
            this.linesContainer.selectAll(`.text-${i}`)
                .data([country[currentState]])
                .transition().duration(1000)
                .attr("x", d => this.graphWidth)
                .attr("y", d => this.scaleY(d[d.length - 1]) - 5)
                .text(t => country.name)
            i++;
        })
    }

    resize(svg, svgWidth, svgHeight) {

        this.svg = svg;
        this.svgWidth = svgWidth;
        this.svgHeight = svgHeight;

        //taille du graph
        this.graphWidth = svgWidth - this.margin.left - this.margin.right;
        this.graphHeight = svgHeight - this.margin.top - this.margin.bottom;

        let container = d3.select(".graphContainer")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.svgXaxis = d3.select(".svgXaxis")
            .attr("transform", `translate(0, ${this.graphHeight})`);
    }
}