/*
    As the log statement says, this module does nothing to persist your data
    across sessions. If your process crashes for any reason, all pads will die.

    This might be useful if you want to debug other parts of the codebase, if
    you want to test out cryptpad without installing mongodb locally, or if
    you don't want to rely on a remote db like the one at mongolab.com.

    Maybe you just like the idea of a forgetful pad? To use this module, edit
    config.js to include a directive `storage: 'cryptpad-amnesia-store', after
    having installed it via npm with `npm install cryptpad-amnesia-store`

    Enjoy!
*/

module.exports.create = function(conf, cb){
    console.log("Loading amnesiadb. This is a horrible idea in production,"+
        " as data *will not* persist\n");

    if (conf.removeChannels) {
        console.log("Server is set to remove channels %sms after the last remaining client leaves.", conf.channelRemovalTimeout);
    }

    var db = {};

    var getChannel = function (channelName) {
        return (channelName in db)?  db[channelName]: (db[channelName] = []);
    };

    // destructive! This function actually modifies the supplied array.
    var trimHistory = function (A) {
        var i = A.length -1;
        console.log(i);

        if (i < 0) { return; }

        // checkpoints found
        var msg;
        var cpf = 0;
        for (;i >= 0;i--) {
            try {
                msg = JSON.parse(A[i].msg);
                if (msg[4].indexOf('cp|') === 0) {
                    if (++cpf === 2) {
                        return A.slice(i);
                        console.log(msg[4]);
                        A.splice(0, i -1);
                        return;
                    }
                }
            }
            catch (err) {
                console.error(err);
                continue;
            }
        }
        return;
    };

    cb({
        message: function(channelName, content, cb){
            var val = {
                msg: content,
                time: +new Date()
            };
            var channel = getChannel(channelName);
            channel.push(val);

            // clean up old longer histories even if people don't reload
            if (!conf.preserveHistory && channel.length > 250) {
                var tmp = trimHistory(channel);
                if (tmp) { channel = db[channelName] = tmp; }
            }
            if (cb) { cb(); }
        },
        getMessages: function(channelName, handler, cb){
            var channel = getChannel(channelName);

            // when you fetch message history, you might as well try to trim it
            if (!conf.preserveHistory && channel.length > 100) {
                var tmp = trimHistory(channel);
                if (tmp) { channel = db[channelName] = tmp; }
            }
            channel.forEach(function (val) { handler(val.msg); });
            if (cb) { cb(); }
        },
        removeChannel: function (channelName, cb) {
            if (channelName in db) { delete db[channelName]; }
            cb();
        },
    });
};
