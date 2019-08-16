module.exports = function (Config, Modules) {

    var scraper = {};

    scraper.scrapePage = function () {
        var deferred = Modules.Q.defer();

        var manufacturers = [
            {
                name: 'Aguila',
                id: '428'
            },
            {
                name: 'Barnes Bullets',
                id: '466'
            },
            {
                name: 'Colt Ammo ',
                id: '504'
            },
            {
                name: 'Federal',
                id: '41'
            },
            {
                name: 'Fiocchi',
                id: '534'
            },
            {
                name: 'Frontier Cartridge',
                id: '298'
            },
            {
                name: 'Hornady',
                id: '36'
            },
            {
                name: 'Nosler',
                id: '161'
            },
            {
                name: 'PMC',
                id: '207'
            },
            {
                name: 'Remington Ammunition',
                id: '445'
            },
            {
                name: 'Sig Sauer',
                id: '450'
            },
            {
                name: 'Tulammo',
                id: '591'
            },
            {
                name: 'Winchester Ammo',
                id: '406'
            }
        ];

        var types = [
            {
                name: 'rifle',
                variations: [
                    {
                        caliber: '223',
                        urls: [
                            {
                                rounds: '1000',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=29'
                            },
                            {
                                rounds: '900',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=301'
                            },
                            {
                                rounds: '800',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=159'
                            },
                            {
                                rounds: '600',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=277'
                            },
                            {
                                rounds: '500',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=9'
                            },
                            {
                                rounds: '400',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=125'
                            },
                            {
                                rounds: '450',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=59'
                            },
                            {
                                rounds: '200',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=13'
                            },
                            {
                                rounds: '180',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=407'
                            },
                            {
                                rounds: '150',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=244'
                            },
                            {
                                rounds: '100',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=22'
                            },
                            {
                                rounds: '50',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=3'
                            },
                            {
                                rounds: '30',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=409'
                            },
                            {
                                rounds: '20',
                                url: 'https://carolinamunitions.com/rifle-ammo/223-remington-5-56-nato.html?rounds=10'
                            }
                        ]
                    }
                ]
            }
        ];

console.log('fetching');
        var getType = function (type) {
            var deferred = Modules.Q.defer();
            var name = type.name;
            var variations = type.variations;

            var getVariations = function (variation) {
                var deferred = Modules.Q.defer();
                var items = variation.urls;

                var scrapeItem = function (item) {
                    var deferred = Modules.Q.defer();
                    var iterateManufacturer = function (manufacturer) {
                        var deferred = Modules.Q.defer();
                        item.manufacturer = manufacturer.name;
                        item.caliber = variation.caliber;
                        item.rounds = item.rounds;
                        item.type = name;
                        item.retailer = 'Carolinamunitions';
                        var url = item.url + '&manufacturer=' + manufacturer.id;

                        var opts = {
                        	headers: {
                        		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
                        		'Sec-Fetch-Mode':'cors',
                        		'sec-fetch-mode': 'navigate',
'sec-fetch-site': 'none',
'sec-fetch-user': '?1',
accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
'scheme': 'https'
                        	},
                            method: 'GET',
                            url: encodeURI('https://carolinamunitions.com'),
                            followAllRedirects: true,
                            jar: Modules.cookieJar
                        };

console.log('scraping url', url);
                        Modules.request(opts, function (err, resp, body) {
                            if (err) {
                                deferred.reject(err);
                            } else {
                                Modules.jsdom.env(body, function (err, window) {
                                    if (err) {
                                        deferred.reject(err);
                                    } else {
                                    	console.log('have body', body);
                                        var $ = Modules.jquery(window);

                                        // loop through elements until brass and steel are found

                                        var urls = [];
                                        $('.details-area').each(function () {
                                            var url = $(this).find('a').attr('href');
                                            console.log('next url', url);
                                            urls.push(url);
                                        });

                                        var iterateList = function (url) {
                                            var deferred = Modules.Q.defer();
                                            var opts = {
                                                method: 'GET',
                                                url: encodeURI(url),
                                                followAllRedirects: true,
                                                jar: Modules.cookieJar
                                            };

                                            Modules.request(opts, function (err, resp, body) {
                                                if (err) {
                                                    deferred.reject(err);
                                                } else {
                                                    Modules.jsdom.env(body, function (err, window) {
                                                        if (err) {
                                                            deferred.reject(err);
                                                        } else {
                                                            var $ = Modules.jquery(window);
                                                            item.product_url = url;
                                                            item.price = parseFloat($('.price').text().replace('$', '')).toFixed(2);
                                                            item.casing = $('th.label:contains("Casing Material")').next().text().trim().toLowerCase();
                                                            item.entry_id = (item.retailer + '_' + item.type + '_' + item.rounds + '_' + item.casing + '_' + item.manufacturer.toLowerCase());
                                                            var entry = JSON.parse(JSON.stringify(item));
                                                            console.log('have entry', entry);
                                                            //console.log("Iterating page", item);
                                                            deferred.resolve(entry);
                                                        }
                                                    });
                                                }
                                            });
                                            return deferred.promise;
                                        };

                                        var itemsToSave = [];
                                        var brassFound = false;
                                        var steelFound = false;

                                        // loop through all variations
                                        var promiseForUrls = Modules.Promise.method(function (condition, action, value) {
                                            if (!condition(value)) return value;
                                            return action(value).then(promiseForUrls.bind(null, condition, action));
                                        });

                                        promiseForUrls(function (innerCount) {
                                            return innerCount < urls.length;
                                        }, function (innerCount) {
                                            return iterateList(urls[innerCount]).then(function (entry) {
                                                if (entry.casing == 'brass' && !brassFound) {
                                                    brassFound = true;
                                                    itemsToSave.push(entry);
                                                }
                                                if (entry.casing == 'steel' && !steelFound) {
                                                    steelFound = true;
                                                    itemsToSave.push(entry);
                                                }
                                                if (brassFound && steelFound) {
                                                    innerCount = urls.length;
                                                }
                                                return ++innerCount;
                                            });
                                        }, 0).then(function () {
                                            // save all items
                                            var saveEntry = function (entry) {
                                                var deferred = Modules.Q.defer();
                                                Modules.Database.query({query: 'SELECT id FROM entries WHERE entry_id = "' + item.entry_id + '"'}).then(function (rows) {
                                                    if (rows.length > 0) {
                                                        Modules.Database.update({
                                                            table: 'entries',
                                                            setAll: entry,
                                                            id: rows[0].id
                                                        }).then(function () {
                                                            console.log('Update', entry);
                                                            Modules.ScraperBuilder.compareUpdate(entry, rows[0]);
                                                            deferred.resolve(entry);
                                                        }, function (err) {
                                                            deferred.reject(err);
                                                        });
                                                    } else {
                                                        Modules.Database.insert({
                                                            table: 'entries',
                                                            obj: entry
                                                        }).then(function () {
                                                            console.log('Insert', entry);
                                                            Modules.ScraperBuilder.compareUpdate(entry);
                                                            deferred.resolve(entry);
                                                        }, function (err) {
                                                            deferred.reject(err);
                                                        });
                                                    }
                                                }, function (err) {
                                                    deferred.reject(err);
                                                });
                                                return deferred.promise;
                                            };

                                            var prom = [];

                                            for (var i in itemsToSave) {
                                                prom.push(saveEntry(itemsToSave[i]));
                                            }

                                            Modules.Q.all(prom).then(function () {
                                                deferred.resolve();
                                            }, function (err) {
                                                deferred.reject(err);
                                            })
                                        }, function (err) {
                                            deferred.reject(err);
                                        });

                                    }
                                });
                            }
                        });
                        return deferred.promise;
                    };

                    // loop through all variations
                    var promiseForManufacturers = Modules.Promise.method(function (condition, action, value) {
                        if (!condition(value)) return value;
                        return action(value).then(promiseForManufacturers.bind(null, condition, action));
                    });

                    promiseForManufacturers(function (count) {
                        return count < manufacturers.length;
                    }, function (count) {
                        return iterateManufacturer(manufacturers[count]).then(function (result) {
                            return ++count;
                        });
                    }, 0).then(function () {
                        deferred.resolve();
                    }, function (err) {
                        deferred.reject(err);
                    });

                    return deferred.promise;
                };

                // loop through all variations
                var promiseForScraping = Modules.Promise.method(function (condition, action, value) {
                    if (!condition(value)) return value;
                    return action(value).then(promiseForScraping.bind(null, condition, action));
                });

                promiseForScraping(function (outerCount) {
                    return outerCount < items.length;
                }, function (outerCount) {
                    return scrapeItem(items[outerCount]).then(function (result) {
                    	console.log('scraped item', result);
                        return ++outerCount;
                    });
                }, 0).then(function () {
                    deferred.resolve();
                }, function (err) {
                    deferred.reject(err);
                });

                return deferred.promise;
            };

            // loop through all variations
            var promiseForVariations = Modules.Promise.method(function (condition, action, value) {
                if (!condition(value)) return value;
                return action(value).then(promiseForVariations.bind(null, condition, action));
            });

            promiseForVariations(function (variationCount) {
                return variationCount < variations.length;
            }, function (variationCount) {
                return getVariations(variations[variationCount]).then(function (result) {
                    return ++variationCount;
                });
            }, 0).then(function () {
                deferred.resolve();
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // loop through all gun types

        var promiseForTypes = Modules.Promise.method(function (condition, action, value) {
            if (!condition(value)) return value;
            return action(value).then(promiseForTypes.bind(null, condition, action));
        });

        promiseForTypes(function (typeCount) {
            return typeCount < types.length;
        }, function (typeCount) {
            return getType(types[typeCount]).then(function (result) {
                return ++typeCount;
            });
        }, 0).then(function () {
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    scraper.determineIfListIsComplete = function (results) {
        var deferred = Modules.Q.defer();
        deferred.resolve({isComplete: true});
        return deferred.promise;
    };

    scraper.runProcess = function () {
        var deferred = Modules.Q.defer();
        var Scraper = new Modules.ScraperBuilder.Scraper();
        var ScraperAssistant = Modules.ScraperAssistant;
        Scraper.url = "https://ammoseek.com/";
        Scraper.company = 'Carolinamunitions';
        Scraper.identifier = 'carolinamunitions';
        Scraper.initIdentifier = 'scraper_' + Scraper.identifier + '_init';
        Scraper.domainRoot = 'https://ammoseek.com/';
        ScraperAssistant.run(Scraper, deferred, scraper);
        return deferred.promise;
    };

    return scraper;
};