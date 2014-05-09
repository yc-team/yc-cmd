'use strict';

//core path
var path = require('path');


//expose
module.exports = new Command;


//Command
function Command(name) {
    this.options = [];
    this._name = name;
}

//flags : '-v, --version'
//desc  : 'show me the version'
function Option(flags, desc) {
    this.flags = flags;

    flags = flags.split(/[ ,|]+/);

    if (flags.length == 2) {
        this.short = flags[0];
        this.long = flags[1];
    }

    this.desc = desc;


}


function showHelpInfo(cmd, options){
    options = options || [];

    //for each options
    for (var i=0; i < options.length; i++) {
        if (options[i] === '-h' || options[i] === '--help') {

            var info = [
                '',
                '  Usage: ' + this._name,
                '',
                '  Options:',
                '',
                '' + this.optionHelp().replace(/^/gm. '    '),
                ''
                '',

            ].join('\n');


            process.stdout.write(info);
        }
    }
}

function pad(source, length){
    //private api so i don't handle source such as Math.asb(source) or ..
    var len = Math.max(0, length - source.length);
    return source + new Array(len + 1).join(' ');
}

Option.prototype.is = function(arg) {
    return arg === this.short || arg === this.long;
};

Option.prototype.name = function() {
    //TODO if has no-
    return this.long.replace('--', '').replace('no-', '')
};


//options'flags max length
Command.prototype.maxOptionLength = function(){
    return this.options.reduce(function(max, option){
        return Math.max(max, option.flags.length);
    }, 0);
};


//option
//TODO: change param object to {key1: value1, key2: value2}
Command.prototype.option = function(flags, desc) {
    var option = new Option(flags, desc),
        name = option.name();

    this.options.push(option);
    
    return this;
};


Command.prototype.optionHelp = function() {
    var maxLenth = this.maxOptionLength(),
        result = [],
        helpFlag = pad('-h, --help', maxLenth);

    result.push(helpFlag + '  output usage information');

    this.options.map(function(option){
        var flag = pad(option.flags, maxLenth);
        result.push(flag + '  ' + option.desc);
    });

    return result.join('\n');

};

Command.prototype.findOption = function(arg) {
    var i = 0,
        len = this.options.length;

    for (; i < len; i++) {
        if (this.options[i].is(arg)) {
            return this.options[i];
        }
    }    

};

Command.prototype.unknownOtion = function(flag) {
    console.error();
    console.error("  error: unknown option '%s'", flag);
    console.error();

    //TODO

};

Command.prototype.parseOptions = function(source) {

    var args = [],
        unknownOptions = [],
        i = 0,
        length = source.length;

    for (; i < length; i++) {
        var arg = source[i];


    }


    return {
        args: args,
        unknown: unknownOptions
    }
};

Command.prototype.parseArgs = function(args, unknown) {
    if (args.length) {

    } else {

        showHelpInfo(this, unknown);

        if (unknown.length > 0) {
            this.unknownOption(unknown[0]);
        }

    }

    return this;
};


//change -abc to -a -b -c
Command.prototype.normalize = function(args) {
    var result = [],
        len = args.length,
        i = 0;

    for (; i < len; i++) {
        var arg = args[i];
        if (arg.length > 1 && '-' == arg[0] && '-' != arg[1]) {
            arg.slice(1).split('').forEach(function() {
                result.push('-' + c);
            });
        } else if(/^--/.test(arg) && ~(index = arg.indexOf('='))) {
            result.push(arg.slice(0, index), arg.slice(index + 1));
        } else {
            result.push(arg);
        }
    }

    return result;  
};

//parse
Command.prototype.parse = function(args) {

    var result;

    //get name
    this._name = this._name || path.basename(args[1], '.js');

    //support change -abc to -a -b -c auto
    var normalized = this.normalize(args.slice(2));

    var parsed = this.parseOptions(normalized); 

    result = this.parseArgs(parsed.args, parsed.unknown);

    return result;
};


Command.prototype.action = function() {

};
