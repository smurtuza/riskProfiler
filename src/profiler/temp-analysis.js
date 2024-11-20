import productConfig from "../config/product.js";
import alarms from "../config/alarms.js"

/**
 * 
 {
    "dateTime": "2024-11-05T01:32:55Z",
    "value": 35.4,
    "confidence0": 0,
    "confidence1": 0,
    "outOfRange": false,
    "inTripBounds": true
}
 */

export function tempAnalysis(product, data) {
    let belowMinCount = 0;
    let aboveMaxCount = 0;
    console.log("product tempAnalysis", productConfig[product])
    const { temperature: { min, max }
    } = productConfig[product];

    const sorted = data.map(record => ({ ...record, time: new Date(record.dateTime).getTime() })).sort((a, b) => a.time - b.time);
    console.log(JSON.stringify({ msg: "sortedrecord", length: sorted.length, record: sorted[0] }))

    sorted.forEach((record) => {
        const { value } = record;
        let increasedTemp = []
        if (value < min) {
            belowMinCount += 1;
            if (increasedTemp.length > 0) {
                console.log(" value < ideal")

                risenTemperatures.push(increasedTemp);
                console.log("risenTemperatures updated 1")
                increasedTemp = [];
            }
        } else if (value > max) {
            aboveMaxCount += 1;
        }
    });
    const risenTemperatures = aboveMaxValues(sorted, max)
    const alarmsCount = countAlarmTriggers(risenTemperatures);
    return {
        report: [{
            "message": "No of times temperature went below required min level",
            "value": belowMinCount
        },
        {
            "message": "No of times temperature went above required max level",
            "value": aboveMaxCount
        },
        {
            "message": "No of times alarms were triggered",
            "value": alarmsCount
        },],
        score: calculateScore(alarmsCount, risenTemperatures)
    }
}

function aboveMaxValues(data, max) {
    // will contain subarrays. 
    // Subarrays will have items that whose temperature is more than max and are consecutive
    const risenTemperatures = [];
    let increasedTemp = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].value > max) {
            console.log("pushed to increasedTemp")
            increasedTemp.push(data[i])

        } else {
            console.log(" value < max", data[i].value, increasedTemp.length)
            if (increasedTemp.length > 0) {
                risenTemperatures.push(increasedTemp);
                increasedTemp = [];
            }
        }
    }


    if (increasedTemp.length > 0) {
        console.log(" value < ideal")

        risenTemperatures.push(increasedTemp);
        console.log("risenTemperatures updated 2")
        increasedTemp = [];
    }
    console.log(risenTemperatures.length)
    return risenTemperatures;
}

function countAlarmTriggers(risenTemperatures) {
    const { temperature: temperatureDeviationLimit } = alarms;
    console.log("temperatureDeviationLimit", temperatureDeviationLimit);
    console.log(JSON.stringify(risenTemperatures))
    const alarmTriggers = risenTemperatures.filter(subarray => {
        if (subarray.length > 1) {
            const startTime = subarray[0].time;
            const endTime = subarray[subarray.length - 1].time;
            const timeDiff = (endTime - startTime) / (1000 * 60);
            console.log("timeDiff", timeDiff);
            return timeDiff >= temperatureDeviationLimit;
        }
    })
    return alarmTriggers.length;
}


/**
 * 
 * 
 */
function calculateScore(alarmsCount, risenTemperatures) {
    const deviations = risenTemperatures.map(records => {
        const temperatures = records.map(record => record.value)
        return Math.max(...temperatures) - Math.min(...temperatures);
    }
    )
    let score = 20;
    if (alarmsCount > 5) {
        score -= 10;
    } else if (alarmsCount > 3) {
        score -= 5
    } else if (alarmsCount > 0) {
        score -= 2;
    }

    const maxDeviation = Math.max(...deviations);
    if (maxDeviation > 8) {
        score -= 10;
    } else if (maxDeviation > 3) {
        score -= 5;
    } else if (maxDeviation > 0) {
        score -= 2
    }
    console.log("score", score)
    return score;
}