var cleanDirty = function(dbfile,cb){
    var dirty = require("dirty");
    var fs = require('fs');

    var db = dirty.Dirty(dbfile);
    var cleandb = dirty.Dirty(dbfile + ".tmp");


    db.once("load", function(length) {
        db.forEach(function(key, val) {
            cleandb.set(key,val);
        });
        cleandb.once("drain", function(){
            db._flush();
            cleandb._flush();
            delete db;
            delete cleandb;
            fs.unlink(dbfile,function(){
                fs.rename(dbfile+".tmp", dbfile,cb);
            });
            delete fs;
        });
    });
}

module.exports.cleandirty = cleanDirty;