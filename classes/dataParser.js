class DataParser extends EventTarget {

    static get eventParsingDone() { return "ParsingDone" };

    data;
    popData;
    cumulativeData;

    constructor(data, popData) {
        super();

        this.data = data;
        this.popData = popData;

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

                    let searchKey;

                    switch (key) {
                        case "US":
                            searchKey = "United States"
                            break;
                        case "Cote d'Ivoire":
                            searchKey = "Ivory Coast"
                            break;
                        case "Fiji":
                            searchKey = "Fiji Islands"
                            break;
                        case "Korea, South":
                            searchKey = "South Korea"
                            break;
                        case "Sri Lanka":
                            searchKey = "SriLanka"
                            break;
                        case "Russia":
                            searchKey = "Russian Federation"
                            break;
                        case "Libya":
                            searchKey = "Libyan Arab Jamahiriya"
                            break;
                        case "Cabo Verde":
                            searchKey = "Cape Verde"
                            break;
                        case "Czechia":
                            searchKey = "Czech Republic"
                            break;
                        case "Congo (Brazzaville)":
                            searchKey = "Congo"
                            break;
                        case "Congo (Kinshasa)":
                            searchKey = "Congo"
                            break;
                        case "Holy See":
                            searchKey = "Holy See (Vatican City State)"
                            break;
                        case "Timor-Leste":
                            searchKey = "East Timor"
                            break;
                        case "West Bank and Gaza":
                            searchKey = "Palestine"
                            break;

                        default:
                            searchKey = key;
                            break;
                    }

                    let c = this.popData.find(e => e.country == searchKey)

                    let obj = {
                        name: key,
                        confirmed: o.map(o => this.giveInt(o.confirmed)),
                        deaths: o.map(o => this.giveInt(o.deaths)),
                        recovered: o.map(o => this.giveInt(o.recovered)),
                        active: o.map(o => this.giveInt(o.confirmed - o.deaths - o.recovered)),


                    };

                    if (c != null) {
                        obj.percent_confirmed = o.map(o => Math.floor((o.confirmed * 100 / parseInt(c.population)) * 100000) / 100000);
                        obj.percent_deaths = o.map(o => Math.floor((o.deaths * 100 / parseInt(c.population)) * 100000) / 100000);
                        obj.percent_recovered = o.map(o => Math.floor((o.recovered * 100 / parseInt(c.population)) * 100000) / 100000);
                        obj.percent_active = o.map(o => Math.floor(((o.confirmed - o.deaths - o.recovered) * 100 / parseInt(c.population)) * 100000) / 100000);
                    } else {
                        obj.percent_confirmed = o.map(o => 0);
                        obj.percent_deaths = o.map(o => 0);
                        obj.percent_recovered = o.map(o => 0);
                        obj.percent_active = o.map(o => 0);
                    }

                    return obj;
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