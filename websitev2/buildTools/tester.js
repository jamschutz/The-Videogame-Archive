const pg = require('pg');
const { POSTGRES_CONNECTION_STRING } = require("./secrets");



async function run() {
    const postgres = new pg.Client(POSTGRES_CONNECTION_STRING);

    await postgres.connect();

    let results = await postgres.query('select "Id", "Name" from "Websites"');
    let websites = results.rows;
    console.log(websites);
}

run();

// postgres.connect();

// postgres.on('connect', (client) => {
//     client.query('select "Id", "Name" from "Websites"', (err, res) => {
//         if(err) 
//             throw err;

//         console.log(res);
//     });
// });