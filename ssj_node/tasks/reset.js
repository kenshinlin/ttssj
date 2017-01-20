var models = require('../config/models');

models(function (err, db) {
    if (err) throw err;

    // db.drop(function (err) {
    //     if (err) throw err;

    //     db.sync(function (err) {
    //         if (err) throw err;

    //         console.log('完成')
    //       // db.models.message.create({
    //       //   title: "Hello world", body: "Testing testing 1 2 3"
    //       // }, function (err, message) {
    //       //   if (err) throw err;

    //       //   db.close()
    //       //   console.log("Done!");
    //       // });
    //     });
    // });

    ['tbl_record'].forEach( dbname=>
        db.models[dbname].sync(function(err){
            !err && console.log(dbname+" sync done!");
        })
    )
}, true);
