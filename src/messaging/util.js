function multiJsonParse(str) {
    let input = str;
    // Add a comma between two objects
    input = input.replace(/}{(?=([^"]*"[^"]*")*[^"]*$)/g, "},{");
    // Add a comma between two arrays
    input = input.replace(/\]\[(?=([^"]*"[^"]*")*[^"]*$)/g, "],[");
    // Add a comma between an array and object
    input = input.replace(/\]{(?=([^"]*"[^"]*")*[^"]*$)/g, "],{");
    input = input.replace(/}\[(?=([^"]*"[^"]*")*[^"]*$)/g, "},[");

    let output;

    try {
        output = JSON.parse("[" + input + "]");
    } catch (error) {
        console.error("There was a problem parsing the message", input);
        throw Error("There was a problem parsing the message");
    }

    return output;
}

export {
    multiJsonParse
}
