var CronJob = require('cron').CronJob;
var amqp = require('amqplib/callback_api');
var axios = require('axios');
var olx = require('./Crawlers/Olx/index.js')

new CronJob('1 */2 * * * *', function () {
    console.log('Run integration');
    axios({
        method: 'post',
        url: `https://stuffshare-web.herokuapp.com/command`,
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




new CronJob('1 0 */10 * * *', function () {
    olx()


}, null, true, null, null, true);


new CronJob('1 0 */3 * * *', function () {
    let cron = olx('get')
    console.log(cron);

}, null, true);
