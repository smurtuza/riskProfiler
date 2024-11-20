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

export function co2Analysis(product, data) {
    let belowMinCount = 0;
    let aboveMaxCount = 0;

    const { temperature: { min, max } } = productConfig[product];

    const sorted = data.map(record => ({ ...record, time: new Date(record.dateTime).getTime() })).sort((a, b) => a.time - b.time);
    console.log(JSON.stringify({ msg: "sortedrecord", length: sorted.length, record: sorted[0] }))

    sorted.forEach((record) => {
        const { value } = record;
        let increasedValues = []
        if (value < min) {
            belowMinCount += 1;
            if (increasedValues.length > 0) {
                console.log(" value < ideal")

                risenValues.push(increasedValues);
                console.log("risenValues updated 1")
                increasedValues = [];
            }
        } else if (value > max) {
            aboveMaxCount += 1;
        }
    });
    const risenValues = aboveMaxValues(sorted, max)
    const alarmsCount = countAlarmTriggers(risenValues);
    return {
        report: [{
            "message": "No of times humidity went below required min level",
            "value": belowMinCount
        },
        {
            "message": "No of times humidity went above required max level",
            "value": aboveMaxCount
        },
        {
            "message": "No of times alarms were triggered",
            "value": alarmsCount
        },],
        score: calculateScore(alarmsCount, risenValues)
    }
}

function aboveMaxValues(data, max) {
    // will contain subarrays. (increasedValues) 
    const risenValues = [];
    // Subarrays will have items that whose temperature is more than max and are consecutive 
    let increasedValues = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].value > max) {
            console.log("pushed to increasedValues")
            increasedValues.push(data[i])

        } else {
            console.log(" value < max", data[i].value, increasedValues.length)
            if (increasedValues.length > 0) {
                risenValues.push(increasedValues);
                increasedValues = [];
            }
        }
    }


    if (increasedValues.length > 0) {
        console.log(" value < ideal")

        risenValues.push(increasedValues);
        console.log("risenValues updated 2")
        increasedValues = [];
    }
    console.log(risenValues.length)
    return risenValues;
}

function countAlarmTriggers(risenValues) {
    const { temperature: temperatureDeviationLimit } = alarms;
    console.log("temperatureDeviationLimit", temperatureDeviationLimit);
    console.log(JSON.stringify(risenValues))
    const alarmTriggers = risenValues.filter(subarray => {
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


function calculateScore(alarmsCount, risenValues) {
    const deviations = risenValues.map(records => {
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