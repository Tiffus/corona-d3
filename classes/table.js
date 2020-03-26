class Table {

    dataParser;
    container;

    constructor(dataParser, container) {

        this.dataParser = dataParser;
        this.container = d3.select(container);

        console.log("new table created");
    }

    //Configure d3 pour l'affichage echelle etc
    configureTable(dataParser, currentState, isUpdate) {

        if (!isUpdate) {
            this.drawTable(dataParser, currentState);
        } else {
            this.updateTable(dataParser, currentState);
        }
    }

    //Dessine une première fois
    drawTable(dataParser, currentState) {
        console.log("draw table");

        let dataTable = [];

        dataParser.cumulativeData.series.forEach(x => {
            const data = {
                countryName: x.name,
                countryNumber: d3.max(x[currentState])
            };

            dataTable.push(data);
        })

        let table = $("#corona-table");

        table.bootstrapTable({
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
            data: dataTable
        });
    }

    //Mise à jour du graphique
    updateTable(dataParser, currentState) {

        let dataTable = [];

        dataParser.cumulativeData.series.forEach(x => {
            const data = {
                countryName: x.name,
                countryNumber: d3.max(x[currentState])
            };

            dataTable.push(data);
        })

        let table = $("#corona-table");

        table.bootstrapTable('load', dataTable);
    }
}