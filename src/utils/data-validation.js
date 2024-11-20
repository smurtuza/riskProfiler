export function validate(product, badSamples) {
    let response = {
        message: "",
        error: false
    };
    console.log(product, badSamples)
    if (!product || !badSamples) {
        response = { message: `badSamples and product are required in query params`, error: true }
    } else {
        if (!["apple", "orange", "banana"].includes(product)) {
            response = { message: `product must be either of "apple", "orange", "banana"`, error: true }
        }

        const numericBadSamples = parseInt(badSamples, 10);
        if (badSamples.length !== 1 || numericBadSamples === NaN || (numericBadSamples < 0 && numericBadSamples > 5)) {
            response = { message: `badSamples must be a number (between 0 & 5)`, error: true }
        }
    }
    return { ...response, data: { product, badSamples: parseInt(badSamples, 10) } };
}