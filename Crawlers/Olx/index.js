
var Crawler = require("crawler");
var parseString = require('xml2js').parseString;
const amqp = require('amqplib/callback_api');
let url = [];
let urlItems = [];
let urlSubregions = []; 
module.exports = (access) => {
    if (access == 'get') {
        return urlItems
    } else {
        urlItems = [];
    }

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
                parseString(res.body, function (err, result) {
                    if (result == undefined) {
                        console.log(res)
                        done();
                        return
                    }
                    const CONN_URL = 'amqp://kyqjanjv:6djuPiJWnpZnIMT1jZ-SvIULv8IOLw2P@hedgehog.rmq.cloudamqp.com/kyqjanjv';
                    let ch = null;

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
                            result.urlset.url.map(item => {

                                if (item.loc[0].includes('nieruchomosci')
                                    || item.loc[0].includes('dla-dzieci')) {


                                    console.log(item.loc[0])
                                    //  let queue = await addToQueue();
                                    //   console.log(queue);
                                    //queue.forEach(item => {
                                    ch.sendToQueue('olx-sitemap-crawler', new Buffer(item.loc[0]), { persistent: true });
                                    //  });
                                    //  console.log(test);
                                    //  ch.close();




                                }
                            })
                        });

                        setTimeout(() => {
                            conn.close();
                            done();

                        }, 5000)
                    })
                })
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




    var c = new Crawler({
        maxConnections: 1,
        rateLimit: 2000,

        // This will be called for each crawled page
        preRequest: function (options, done) {
            done();

        },
        callback: async function (error, res, done) {
            if (error) {
                console.log(error);
                done();
            } else {
                var $ = res.$;
                // $ is Cheerio by default
                //a lean implementation of core jQuery designed specifically for the server
                // console.log($.html())
                //     console.log($('a[data-cy="page-link-next"]'));
                let offer = $('table[data-id]')
                let stopCrawling = false;
                let itemsToSend = [];

                Object.keys(offer).filter(item => {
                    return isNaN(item) == false
                }).map(item => {
                    let tbody = offer[item].children.filter(el => { return el.name == 'tbody' })[0];
                    let tr = tbody.children.filter(el => { return el.name == 'tr' });
                    //console.log(tr)
                    tr.map(trElement => {
                        //console.log(trElement)
                        trElement.children.filter(el => {
                            if (el.name == 'td' && el.attribs.valign == 'bottom' && el.attribs.class == 'bottom-cell') {
                                el.children.filter(dataEl => {
                                    if (dataEl.name == 'div') {
                                        dataEl.children.filter(p => {
                                            if (p.name == 'p') {
                                                p.children.filter(small => {
                                                    if (small.name == 'small') {
                                                        small.children.filter(span => {
                                                            if (span.name == 'span') {
                                                                if (span.children.filter(i => {
                                                                    return i.name == 'i' && i.attribs["data-icon"] == "clock"
                                                                }).length > 0) {
                                                                    if (!span.children[2].data.includes('dzisiaj')) {
                                                                        stopCrawling = true;
                                                                    } else {
                                                                        tr.map(trChildren => {
                                                                            trChildren.children.map(td => {
                                                                                if (td.name == 'td' && td.attribs.rowspan == '2') {

                                                                                    td.children.forEach(a => {

                                                                                        if (a.name == 'a') {


                                                                                            if (url.filter(urlFilter => {
                                                                                                return urlFilter == a.attribs.href
                                                                                            }).length > 0) {
                                                                                                //  done();
                                                                                                return;
                                                                                            } else {
                                                                                                if (!a.attribs.href.includes('https://www.olx.pl')) {
                                                                                                    return
                                                                                                }
                                                                                                console.log(a.attribs.href)
                                                                                                console.log(span.children[2].data)
                                                                                                urlItems.push(a.attribs.href)
                                                                                                itemsToSend.push(a.attribs.href);
                                                                                                console.log(urlItems.length)

                                                                                                //     c_items.queue({
                                                                                                //         uri: a.attribs.href,
                                                                                                //         forceUTF8: false,
                                                                                                //         headers: {
                                                                                                //              "Content-Type": "application/json",
                                                                                                //              "sec-fetch-site": "same-origin",
                                                                                                //              "sec-fetch-mode": "navigate",
                                                                                                //              "sec-fetch-user": "?1",
                                                                                                //              "upgrade-insecure-requests": 1,
                                                                                                //              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


                                                                                                //           }

                                                                                                //      })
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                }
                                                                            });
                                                                        })
                                                                    }
                                                                    //console.log(span.children[2].data.includes('dzisiaj'))
                                                                }
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    })
                });
                const CONN_URL = 'amqp://kyqjanjv:6djuPiJWnpZnIMT1jZ-SvIULv8IOLw2P@hedgehog.rmq.cloudamqp.com/kyqjanjv';
                let ch = null;
                await new Promise((res, rej) => {
                    amqp.connect(CONN_URL, function (err, conn) {
                        if (err) {
                            console.log(err);
                            return
                        }
                        conn.createChannel(async function (err2, channel) {
                            if (err2) {
                                console.log(err2);
                                return
                            } ch = channel;
                            channel.assertQueue('olx-link-items', {
                                durable: true
                            });

                            //  let queue = await addToQueue();
                            //   console.log(queue);
                            //queue.forEach(item => {
                            ch.sendToQueue('olx-link-items', new Buffer(JSON.stringify(itemsToSend)), { persistent: true });
                            //  });
                            //  console.log(test);
                            res();
                            //  ch.close();
                            done();
                        });

                        setTimeout(() => {
                            conn.close();

                        }, 1000)
                    });
                });
                if (stopCrawling == true) {
                    done();
                    return;
                }
                if (url.filter(item => {
                    return item == $('a[data-cy="page-link-next"]').attr('href')
                }).length > 0) {
                    done();
                    return;
                } else {
                    url.push($('a[data-cy="page-link-next"]').attr('href'));
                }
                c.queue({
                    uri: $('a[data-cy="page-link-next"]').attr('href'),
                    forceUTF8: false,
                    headers: {
                        "Content-Type": "application/json",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": 1,
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"


                    }

                })
            }
            done();
        }
    });


    // Queue just one URL, with default callback


    // Queue some HTML code directly without grabbing (mostly for tests)
}