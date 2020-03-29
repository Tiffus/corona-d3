class Main {

    static get BASE_URL() { return "https://pomber.github.io/covid19/timeseries.json" };
    static get BASE_URL_POP() { return "https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-population.json" };
    static get DEFAULT_MESSAGE() { return "Move your mouse over a line to see infos." };

    buttons;
    buttonsScale;

    svgWidth;
    svgHeight;

    rawData;
    popData;

    dataParser;
    graph;
    dataTable;
    firstDraw = true;

    allLines;
    allText;

    currentState = "confirmed";

    constructor() {
        //Fait les calcul préliminaires pour l'affichage
        this.configureDOM();

        //Charge le CSV
        this.loadData(Main.BASE_URL);
    }

    configureDOM() {

        this.calculateSize();

        //Définition du svg de base avec ses marges
        this.svg = d3.select(".graph").append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)
    }

    calculateSize() {
        //Taille du svg
        this.svgWidth = document.querySelector(".graph").offsetWidth;
        this.svgHeight = 700;

    }

    loadData(url) {
        d3.json(url).then(data => {
            this.rawData = data;
            this.loadDataPop()
        });
    }

    /*
    Après le chargement on fait les calculs nécessaires sur les données pour avoir un jeu propre
    */
    loadDataPop() {
        d3.json(Main.BASE_URL_POP).then(data => {
            this.popData = data;
            this.begin();
        });
    }

    begin() {
        //ParseData
        this.dataParser = new DataParser(this.rawData, this.popData);
        this.dataParser.addEventListener(DataParser.eventParsingDone, this.onDataParsed.bind(this));
        this.dataParser.parseData();
    }

    onDataParsed(e) {
        this.dataParser.removeEventListener(DataParser.eventParsingDone, this.onDataParsed.bind(this));

        const last = document.querySelector(".lastupdate");

        const time = this.dataParser.cumulativeData.dates[this.dataParser.cumulativeData.dates.length - 1];
        const formatTime = d3.timeFormat("%B %d, %Y");
        last.innerHTML = `<small>last update: ${formatTime(time)}</small>`;

        //Create Graph

        if (this.graph == null) {
            this.graph = new Graph(this.svg, this.svgWidth, this.svgHeight);
        }

        const tableContainer = document.querySelector("tbody");
        this.table = new Table(this.dataParser, tableContainer);

        this.drawPage();

    }

    drawPage() {

        if (this.firstDraw) {
            this.firstDraw = false;

            //Graph
            this.graph.configureGraph(this.dataParser, this.currentState, false);

            //Table
            this.table.configureTable(this.dataParser, this.currentState, false);

            this.configureEvents();

        } else {
            //Graph
            this.graph.configureGraph(this.dataParser, this.currentState, true);

            //Table
            this.table.configureTable(this.dataParser, this.currentState, true);
        }
    }

    configureEvents() {

        //GET all SVG elements
        this.allLines = document.querySelectorAll("svg .line");
        this.allText = document.querySelectorAll("svg .text");

        this.allLines.forEach(l => {
            l.addEventListener("mouseover", this.onMouseOver.bind(this));
            l.addEventListener("mouseout", this.onMouseOut.bind(this));
            l.setAttribute("data-event", "true");
        });

        //Buttons
        this.buttons = document.querySelectorAll(".btnState");
        this.buttons.forEach(b => b.addEventListener("click", this.onClickButton.bind(this)));

        //Buttons scale
        this.buttonsScale = document.querySelectorAll(".btnScale");
        this.buttonsScale.forEach(b => b.addEventListener("click", this.onClickButtonScale.bind(this)));

        //Search
        const search = document.querySelector(".search-input");
        search.addEventListener("keyup", this.onSearchChange.bind(this));

        window.addEventListener("resize", this.onResize.bind(this));
    }

    onSearchChange(e) {
        const search = document.querySelector(".search-input");

        if (search.value.length > 0) {

            const lines = document.querySelectorAll(`svg [data-name*="${search.value}" i]`);

            //remove style and listener for all
            this.allLines.forEach(l => {
                l.setAttribute("data-event", "false");

                l.classList.add("dimmed");
                document.querySelector(`.text-${l.dataset.id}`).classList.add("dimmed");
            });

            this.allText.forEach(t => {
                t.classList.add("dimmed");
            });

            //add style and listener for selected
            if (lines.length > 0) {

                lines.forEach(l => {
                    l.classList.remove("dimmed");
                    l.classList.add("highlight");

                    document.querySelector(`.text-${l.dataset.id}`).classList.remove("dimmed");
                });
            }
        } else {
            this.allLines.forEach(l => {
                l.setAttribute("data-event", "true");
            });

            this.resetLines();
        }
    }

    ///////////////////////////////BUTTONS//////////////////////////////

    //Changement de CSV au clic sur les boutons
    onClickButton(e) {
        //console.log(BASE_URL + e.target.dataset.file);

        this.buttons.forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");

        this.currentState = e.target.dataset.file;
        this.graph.state = e.target.dataset.state;

        this.drawPage();
    }

    //Changement de scale log ou linear
    onClickButtonScale(e) {
        this.graph.isLinear = !this.graph.isLinear;

        this.graph.configureGraph(this.dataParser, this.currentState, true);
        this.table.configureTable(this.dataParser, this.currentState, true);


        this.buttonsScale.forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
    }


    ///////////////////////////////SURVOL//////////////////////////////


    //Survol d'une ligne avec la souris
    onMouseOver(e) {

        if (!e.currentTarget.classList.contains("dimmed")) {
            const name = document.querySelector(".subtitle");
            name.innerHTML = `${e.target.dataset.name} : ${e.target.dataset.last} people ${this.graph.state} since the beginning of the COVID-19 pandemy`;
        }

        if (e.currentTarget.dataset.event == "true") {

            this.allLines.forEach(l => {
                if (l == e.currentTarget) {
                    l.classList.add("highlight");
                    document.querySelector(`.text-${l.dataset.id}`).classList.remove("dimmed");
                } else {
                    l.classList.add("dimmed");
                    document.querySelector(`.text-${l.dataset.id}`).classList.add("dimmed");
                }
            });
        }
    }

    //Sortie du survol
    onMouseOut(e) {
        if (e.currentTarget.dataset.event == "true") {
            this.resetLines();
        }
    }

    resetLines() {
        const name = document.querySelector(".subtitle");

        name.innerHTML = Main.DEFAULT_MESSAGE;

        this.allLines.forEach(l => {
            if (l.dataset.event == "true") {
                l.classList.remove("highlight");
                l.classList.remove("dimmed");
            }
        });

        this.allText.forEach(t => {
            t.classList.remove("highlight");
            t.classList.remove("dimmed");
        });
    }


    onResize() {

        this.calculateSize();

        this.svg = d3.select(".graph svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)

        this.graph.resize(this.svg, this.svgWidth, this.svgHeight);

        //Graph
        this.graph.configureGraph(this.dataParser, this.currentState, true);
    }
}