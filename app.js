const csv = require('csvtojson');
const fs = require('fs');
const { parseAsync } = require('json2csv');
const formatChip007Keys = require('./helpers/formatChip007Keys');
const generateHash = require('./helpers/getHashFromfile');

const filePath = 'hngNFTs.csv';

const jsonResult = 'CHIP-0007-output.json';
const csvResult = `${filePath.split('.')[0]}.output.csv`;

(async function () {
    let jsonArray;

    try {
        jsonArray = await csv().fromFile(filePath);
    } catch (error) {
        console.log('Error: ', error.message);
        return;
    }
    const newArr = [];

    for (let obj of jsonArray) {

        obj = {
            format: 'CHIP-0007',
            ...obj,
        };
        const formattedObj = formatChip007Keys(obj);

        if (formattedObj.attributes) {
            const attributesArr = formattedObj.attributes.split(',');
            const attrFormattedArr = [];

            for (let attr of attributesArr) {
                const attrSplit = attr.split(':');
                if (attrSplit[0] && attrSplit[1]) {
                    attrFormattedArr.push(
                        formatChip007Keys({
                            [`${attrSplit[0].trim()}`]: attrSplit[1].trim(),
                        })
                    );
                }
            }

            formattedObj.attributes = attrFormattedArr;
        } else {
            formattedObj.attributes = [];
        }

        newArr.push(formattedObj);
    }

    fs.writeFile(
        jsonResult,
        JSON.stringify(newArr),
        { encoding: 'utf8' },
        async (err) => {
            if (err) {
                console.error('Error occured: ', err);
                return;
            }
            console.log('file written successfully');

            const hash = generateHash(jsonResult);
            console.log('Done with hash');

            for (let obj of jsonArray) {
                obj['Hash'] = hash;
            }

            const csvOutput = await parseAsync(jsonArray);

            fs.writeFile(csvResult, csvOutput, { encoding: 'utf8' }, (err2) => {
                if (err2) {
                    console.error('Error occured: ', err2);
                    return;
                }

            });
        }
    );
})();
