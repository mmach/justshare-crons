
var Crawler = require("crawler");
var parseString = require('xml2js').parseString;
const amqp = require('amqplib/callback_api');
let url = [];
let urlItems = [];
let urlSubregions = [];
let load_categories = (pool,sql) => {


    var c_sitemap_regions = new Crawler({
        maxConnections: 1,
        rateLimit: 2000,

        // This will be called for each crawled page
        preRequest: function (options, done) {
            done();

        },
        callback: function (error, res, done) {
            if (error) {
                console.log(error);
            } else {
                parseString(res.body
                    , function (err, result) {
                        if (err) {
                            console.log(err);
                            done();
                        }
                        result.sitemapindex.sitemap.filter(item => {
                            if (item.loc[0].indexOf('subregion') > 0) {

                                c_sitemap_regions_elements.queue({
                                    uri: item.loc[0],
                                    forceUTF8: false,
                                    headers: {
                                        "Content-Type": "application/json",
                                        "sec-fetch-site": "same-origin",
                                        "sec-fetch-mode": "navigate",
                                        "sec-fetch-user": "?1",
                                        "upgrade-insecure-requests": 1,
                                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


                                    },
                                    skipDuplicates: true

                                })

                            }
                        })
                    });
                done();
            }
        }
    }
    );

    var c_sitemap_regions_elements = new Crawler({
        maxConnections: 2,
        retries: 10,
        retryTimeout: 60000,
        // This will be called for each crawled page

        callback: function (error, res, done) {
            console.log(c_sitemap_regions.queueSize)
            console.log(c_sitemap_regions_elements.queueSize)

            if (error) {
                console.log(ERROR);
                console.log(error);
                setTimeout(() => {
                    done();
                }, 60000)
            } else {
                parseString(res.body,async  function (err, result) {
                    if (result == undefined) {
                        console.log(res)
                        done();
                        return
                    }
                    const CONN_URL = 'amqp://kyqjanjv:6djuPiJWnpZnIMT1jZ-SvIULv8IOLw2P@hedgehog.rmq.cloudamqp.com/kyqjanjv';
                    let ch = null;



                    let items = result.urlset.url.map(async item => {

                        if (item.loc[0].includes('nieruchomosci')
                            || item.loc[0].includes('dla-dzieci')) {


                            console.log(item.loc[0])
                            //  let queue = await addToQueue();
                            //   console.log(queue);
                            //queue.forEach(item => {

                            //  });
                            //  console.log(test);
                            //  ch.close();

                            return await pool.request().input('sitemap_link',sql.Text, item.loc[0]).input('integration_name', sql.Text, 'OLX_PL').execute(`INSERT_Sitemap`)



                        }
                    })
                    await Promise.all(items)
                });

                setTimeout(() => {
                    done();

                }, 5000)

            }
        }
    }
    );


    c_sitemap_regions.queue({
        uri: "https://www.olx.pl/sitemap.xml",
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


        },
        skipDuplicates: true

    })
    // Queue some HTML code directly without grabbing (mostly for tests)
}


let start_crawler = async (pool,sql) => {
    const CONN_URL = 'amqp://kyqjanjv:6djuPiJWnpZnIMT1jZ-SvIULv8IOLw2P@hedgehog.rmq.cloudamqp.com/kyqjanjv';
    let ch = null;

    const result_sitemap = await pool.query` SELECT * FROM Sitemap
    WHERE integration_id IN ( SELECT id FROM Integration Where Name='OLX_PL')`;
    amqp.connect(CONN_URL, function (err, conn) {
        if (err) {
            console.log("CONNECTION ERROR");

            console.log(err);
            setTimeout(() => {
                done();
                conn.close();

            }, 60000)
            return;
        }
        conn.createChannel(async function (err2, channel) {
            if (err2) {
                console.log("CHANEL ERROR");

                console.log(err);
                setTimeout(() => {
                    done();
                }, 60000)
                return
                // throw err2;
            } ch = channel;
            channel.assertQueue('olx-sitemap-crawler', {
                durable: true
            });

            result_sitemap.recordset.map(async item => {



                console.log(item.link)
                //  let queue = await addToQueue();
                //   console.log(queue);
                //queue.forEach(item => {

                ch.sendToQueue('olx-sitemap-crawler', new Buffer(item.link), { persistent: true });
                //  });
                //  console.log(test);
                //  ch.close();

            })
        });

        setTimeout(() => {
            conn.close();

        }, 60000)
    })
}
module.exports = {
    load_categories,start_crawler

}