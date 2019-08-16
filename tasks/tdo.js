module.exports = function (Config, Modules) {

    var self = this;
    var Tdo = {};
    var BullhornAPI = Modules.Bullhorn.API;

    Tdo.init = function () {

        Modules.Database.query({
            query: "Select * from potential_fees",
            obj: []
        }).then(function (response) {

            var get_joborderID = [];

            for (var i = 0; i < response.length; i++) {

                //get_joborderID.push(response[i].jobOrderId);

                var query = {
                    "params": {
                        "type": "query",
                        "entity": "JobOrder",
                        "queryParams": [
                            {
                                property: "id",
                                symbol: '=',
                                value: response[i].jobOrderId,
                                notLiteral: true

                            },

                        ]
                    }
                };


            }

            Modules.Bullhorn.API.query(query).then(function (res) {
                //console.log(res)
                for (var j = 0; j < res.length; j++) {

                    //console.log(res[j].id)
                    //console.log(res[j].type)
                    Modules.Database.query({
                        query: "update `potential_fees` set TDO = " + res[j].type + " where jobOrderId =" + res[j].id,
                        obj: []

                    }).then(function (response) {
                        console.log("TDO UPDATED SUCCESSFULLY")
                    })

                }

            });

        });


    }


    return Tdo;
}
    
