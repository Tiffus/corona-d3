class Table {

    dataParser;
    container;
    table;
    dataTable;

    constructor(dataParser, container) {

        this.dataParser = dataParser;
        this.container = d3.select(container);
        this.table = $("#corona-table");

        console.log("new table created");
    }

    //Configure d3 pour l'affichage echelle etc
    configureTable(dataParser, currentState, isUpdate) {

        this.dataTable = [];

        dataParser.cumulativeData.series.forEach(x => {
            const data = {
                countryName: x.name,
                countryNumber: x[currentState][x[currentState].length - 1]
            };

            this.dataTable.push(data);
        })

        if (!isUpdate) {
            this.drawTable(dataParser, currentState);
        } else {
            this.updateTable(dataParser, currentState);
        }
    }

    //Dessine une première fois
    drawTable(dataParser, currentState) {
        console.log("draw table");

        this.table.bootstrapTable({
            search: true,
            sortName: 'countryNumber',
            sortOrder: 'desc',
            columns: [{
                field: "countryName",
                sortable: true
            }, {
                field: "countryNumber",
                sortable: true
            }],
            data: this.dataTable
        });
    }

    //Mise à jour du graphique
    updateTable(dataParser, currentState) {

        this.table.bootstrapTable('load', this.dataTable);
    }
}