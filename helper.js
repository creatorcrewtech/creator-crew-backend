const generateUrlMapping = (signedUrls, itemNames) => {
    const resultArray = [];

    for (let i = 0; i < itemNames.length; i++) {
        const url = signedUrls.find(signedUrl =>
            signedUrl.includes(itemNames[i])
        );

        if (url) {
            resultArray.push({
                url: url,
                name: itemNames[i]
            });
        }
    }

    return resultArray;
}

module.exports = {
    generateUrlMapping
}