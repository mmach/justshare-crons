var CronJob = require('cron').CronJob;
var amqp = require('amqplib/callback_api');
var axios = require('axios');
var olx = require('./Crawlers/Olx/index.js')
const sql = require('mssql')



    new CronJob('1 */2 * * * *', function () {
        console.log('Run integration');
        axios({
            method: 'post',
            url: `https://justshare-api-justshare.e4ff.pro-eu-west-1.openshiftapps.com/command`,
            data: {
                "action": "syncItemCommand"
                , "model": {}
            }
        }).then(succ3 => {
            console.log(" [x] RUN SYNC DONE");

        }, err3 => {
            console.log(err3);
        })




    }, null, true, 'America/Los_Angeles');



/*
    new CronJob('1 30 1 * * *', async function () {

        try {
            // make sure that any items are correctly URL encoded in the connection string

            const result = await pool.query`select * from Integration WHERE IsActive=1`;
            console.dir(result)
            let promisesList = result.recordset.map(async item => {

                if (item.Name == 'OLX_PL') {
                    return await olx.load_categories(pool,sql)
                }
            });
            await Promise.all(promisesList)
        } catch (err) {
            console.log(err);
            // ... error checks
        }



    }, null, true);
*/
/*
    new CronJob('1 1 * * * *', async function () {
        try {
            // make sure that any items are correctly URL encoded in the connection string
            const result = await pool.query`select * from Integration WHERE IsActive=1`;
            console.dir(result)
            let promisesList = result.recordset.map(async item => {

                if (item.Name == 'OLX_PL') {
                    return await olx.start_crawler(pool,sql)

                }
            });
            await Promise.all(promisesList)
        } catch (err) {
            console.log(err);
            // ... error checks
        }

    }, null, true);
*/