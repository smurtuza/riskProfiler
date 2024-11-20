
/**
 * 
 
 */

export function lightAnalysis(data) {

    const sorted = data.map(record => ({ ...record, time: new Date(record.dateTime).getTime() })).sort((a, b) => a.time - b.time);
    console.log(JSON.stringify({ msg: "sortedrecord", length: sorted.length }))

    const { lightOnCount, lightOnDurations } = aboveMaxValues(sorted, 1)
    const totalDuration = analyseLight(lightOnDurations);
    return [{
        "message": "No of times door was opened",
        "value": lightOnCount
    },
    {
        "message": "Duration for which door was opened",
        "value": totalDuration
    }]

}

function aboveMaxValues(data, max) {
    // will contain subarrays. (lightOn) 
    const lightOnDurations = [];
    // Subarrays will have items that whose temperature is more than max and are consecutive 
    let lightOn = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].value > max) {
            console.log("pushed to lightOn")
            lightOn.push(data[i])

        } else {
            console.log(" value < max", data[i].value, lightOn.length)
            if (lightOn.length > 0) {
                lightOnDurations.push(lightOn);
                lightOn = [];
            }
        }
    }


    if (lightOn.length > 0) {
        console.log(" value < ideal")

        lightOnDurations.push(lightOn);
        console.log("lightOnDurations updated 2")
        lightOn = [];
    }
    console.log(lightOnDurations.length)
    return { lightOnCount: lightOnDurations.length, lightOnDurations };
}

function analyseLight(lightOnDurations) {
    let totalDuration = 0
    lightOnDurations.forEach(subarray => {
        if (subarray.length > 1) {
            const startTime = subarray[0].time;
            const endTime = subarray[subarray.length - 1].time;
            const timeDiff = (endTime - startTime) / (1000 * 60);
            console.log("timeDiff", timeDiff);

            totalDuration += timeDiff;
        }
    })
    totalDuration = Math.floor(totalDuration);
    if (totalDuration > 60) {
        const hours = parseInt(totalDuration / 60, 10);
        const mins = parseInt(totalDuration % 60, 10);
        return `${hours}h ${mins}mins `
    }
    return `${totalDuration} mins`
}

