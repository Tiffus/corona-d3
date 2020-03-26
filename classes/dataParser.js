class DataParser extends EventTarget {

    static get eventParsingDone() { return "ParsingDone" };

    data;
    cumulativeData;

    constructor(data) {
        super();
        this.data = data;
        this.cumulativeData;
    }
    parseData() {

        // https://github.com/pomber/covid19
        // https://pomber.github.io/covid19/timeseries.json

        //console.log("data", this.data);
        //tableau pour les dates

        const firstEntry = this.data[Object.keys(this.data)[0]];

        //Format Dates
        const dates = firstEntry.map(x => x["date"]);
        const uniqueDates = [...new Set(dates)];

        const formatTime = d3.timeParse("%Y-%m-%d");

        this.cumulativeData = {
                dates: uniqueDates.map(x => formatTime(x)),
                series: Object.keys(this.data).map(key => {
                    let o = this.data[key];

                    return {
                        name: key,
                        confirmed: o.map(o => this.giveInt(o.confirmed)),
                        deaths: o.map(o => this.giveInt(o.deaths)),
                        recovered: o.map(o => this.giveInt(o.recovered)),
                        active: o.map(o => this.giveInt(o.confirmed - o.deaths - o.recovered))
                    };
                })
            }
            //console.log(this.cumulativeData);

        this.onParsingDone();
    }

    giveInt(value) {
        if (value == null) {
            return 0;
        } else {
            return parseInt(value);
        }
    }

    onParsingDone() {
        console.log("data parsing done");
        const evt = new Event(DataParser.eventParsingDone);
        this.dispatchEvent(evt);
    }
}