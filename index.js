'use strict';

//core path
var path = require('path');
var EventEmitter = require('events').EventEmitter;

var pkg = require('./package.json');

//expose
module.exports = new Command;


//Command
function Command(name) {
    this.options = [];
    this.commands = [];
    this.args = [];
    this.name = name;
}

/**
 * @param {String} flags   : '-v, --version'
 * @param {String} desc    : 'show me the version'
 */
function Option(flags, desc) {
    this.flags = flags;

    //like : install <repo>
    //<repo> is required
    // ~ 加1取反 ~1 ==> -2
    this.required = ~flags.indexOf('<');

    //TODO
    //'-i, --install <repo>'.split(/[ ,|]+/)
    //["-i", "--install", "<repo>"]
    flags = flags.split(/[ ,|]+/);

    //TODO
    //!/^[[<]/.test(flags[1]) ?
    if (flags.length > 1 && !/^[[<]/.test(flags[1])) {
        this.short = flags.shift();
    }

    this.long = flags.shift();

    this.desc = desc || '';

}


function showHelpInfo(cmd, options){
    options = options || [];

    //for each options
    for (var i=0; i < options.length; i++) {
        if (options[i] === '-h' || options[i] === '--help') {
            var info = cmd.helpInfo();
            process.stdout.write(info);
            process.exit(0);
        } else if (options[i] === '-v' || options[i] === '--version') {
            //TODO
            if (cmd._version) {
                console.log(this._version);
            }else {
                console.log(pkg.version);
            }
            process.exit(0);
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

//inherit from EventEmitter
Command.prototype.__proto__ = EventEmitter.prototype;

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

    //on name
    this.on(name, function(val){

    });
    
    return this;
};

/**
 * @name commandHelp
 * @return command help doc 
 */
Command.prototype.commandHelp = function(){

    if (!this.commands.length) {
        return '';
    }

    return [
        '',
        '  Commands:',
        '',
        this.commands.map(function(command){

            //first handle args
            var args = command.args.map(function(arg){
                return arg.required ? '<' + arg.name + '>' : '[' + arg.name +']';
            }).join(' ');

            var name = command.name,
                options = command.options,
                desc = command.desc();

            return name + (options.length ? ' [options]' : '') + ' ' + args + (desc? '\n' + desc : '');

        }).join('\n\n').replace(/^/gm, '    '),
        ''
    ].join('\n');

};

/**
 * @name optionHelp
 * @return option help doc 
 */
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

/**
 * @name helpInfo
 * @return command help doc 
 */
Command.prototype.helpInfo = function(){
    var result = [
        '',
        '  Usage: ' + this.name + ' ' + this.usage(),
        '' + this.commandHelp(),
        '  Options:',
        '',
        '' + this.optionHelp().replace(/^/gm, '    '),
        '',
        '',
    ].join('\n');

    return result;
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

/** 
 * @name unknownOption
 * @param {String} flag
 * @info output unknow option
 */
Command.prototype.unknownOption = function(flag) {
    console.error();
    console.error("  error: unknown option '%s'", flag);
    console.error();

    //TODO
    process.exit(1);
};

//optionMissingArg
Command.prototype.optionMissingArg = function(option){
    console.error();
    console.error("  error: option '%s argument missing", option.flags);
    console.error();
    //TODO
    process.exit(1);
};

/**
 * @name missingArg output required argument name is missing
 * @param {String} name
 */
Command.prototype.missingArg = function(name){
    console.error();
    console.error("  error: missing required argument '%s'", name);
    console.error();
    process.exit(1);
};

//parseOptions
Command.prototype.parseOptions = function(source) {

    var args = [],
        unknownOptions = [],
        i = 0,
        length = source.length;

    for (; i < length; i++) {
        var arg = source[i];

        var option = this.findOption(arg);

        if (option) {

            //option name
            var name = option.name();

            //check required
            if (option.required) {
                arg = source[++i];
                if (arg == null) {
                    return this.optionMissingArg(option);
                }

                this.emit(name, arg);
            } else {
                //emit name
                this.emit(name);
            }

            //break current if
            continue;
        }

        //commander use '-' == arg[0]
        //i prefer charAt for string for use [0] more like array fn
        if (arg.length > 1 && arg.charAt(0) === '-') {
            unknownOptions.push(arg);

            //break current if
            continue;
        }

        //put arg like -h
        args.push(arg);

    }


    return {
        args: args,
        unknown: unknownOptions
    }
};

/**
 * @name parseArgs
 * @param args {Array}
 * @param unknown
 */
Command.prototype.parseArgs = function(args, unknown) {
    if (args.length) {
        var name = args[0];

        if (this.listeners(name).length) {
            //args.shift() return args[0]
            //args will rm first item
            this.emit(args.shift(), args, unknown);
        }

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
            arg.slice(1).split('').forEach(function(c) {
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

/**
 * @name parse
 * @param [Array] default process.argv
 */
Command.prototype.parse = function(args) {

    args = args || process.argv;

    var result;

    //get name
    this.name = this.name || path.basename(args[1], '.js');

    //use normalize to support change [-abc] to [-a -b -c] auto
    var normalized = this.normalize(args.slice(2));

    //parse options
    var parsed = this.parseOptions(normalized); 

    result = this.parseArgs(parsed.args, parsed.unknown);

    return result;
};


//version
Command.prototype.version = function(str) {

    if (arguments.length === 0) {
        this._version = pkg.version;
    } else {
        this._version = str;
    }

    //use this.option(flags, desc)
    this.option('-v, --version', 'output the version number');

    //on version
    this.on('version', function(){
        console.log(this._version);
        //TODO
        process.exit(0);
    });

    return this;
};

//desc
Command.prototype.desc = function(source){
    //get
    if (arguments.length === 0) {
        return this._desc;
    } else {
        this._desc = source;
    }

    return this;
};

/**
 * @name parseExpectedArgs 
 * @param {Array} args
 * @info for command('exec <cmd>')
 *  find <cmd> and set required in this.args
 */
Command.prototype.parseExpectedArgs = function(args){
    if (!args.length) {
        return;
    }

    var that = this;

    //each args
    args.forEach(function(arg){
        //i prefer use String's charAt instead of Array-like [0]
        switch (arg.charAt(0)) {
            case '<' : 
                that.args.push({
                    required: true,
                    name: arg.slice(1, -1)
                });
                break;

            case '[' :
                that.args.push({
                    required: false,
                    name: arg.slice(1, -1)
                });
                break;
        }
    });

    return this;
};

/**
 * @name command
 * @param {String} name
 * @param {String} desc
 * @api public & core
 * @with 
 *      Command.prototype.desc 
 *      Command.prototype.action
 * @example 
 *   program
 *      .command('exec <cmd>', 'exec some cmd')
 *      .action(function(){
 *           //...
 *      });
 *
 */
Command.prototype.command = function(name, desc){

    //support name = 'exec <cmd>'
    var args = name.split(/ +/);

    //use shift() to get exec
    var cmd = new Command(args.shift());

    //push to this.commands
    this.commands.push(cmd);

    cmd.parseExpectedArgs(args);

    //for action
    cmd.parent = this;

    //if has second param desc
    if (desc) {
        cmd.desc(desc);
    }

    return cmd;
};


/**
 * @name usage
 * @param {String}
 * @with 
 *      Command.prototype.command
 * @support get and set 
 */
Command.prototype.usage = function(source){

    //for args
    var args = this.args.map(function(arg){
        return arg.required ? '<' + arg.name + '>' : '[' + arg.name + ']';
    });

    var usage = '[options' + (this.commands.length ? '] [Command' : '') + ']'
         + (this.args.length ? ' ' + args : '');
    
    //get or set
    if (arguments.length === 0) {
        return this._usage || usage;
    } else {
        this._usage = source;
    }

    return this;
};

/**
 * @name action
 * @param {Function} fn
 * @api public & core
 * @with 
 *      Command.prototype.command
 */
Command.prototype.action = function(fn) {
    var that = this,
        name = this.name;

    //on    
    this.parent.on(name, function(args, unknown){

        unknown = unknown || [];

        var parsed = that.parseOptions(unknown);

        //show help
        showHelpInfo(that, parsed.unknown);

        //still output unknown
        if (parsed.unknown.length > 0) {
            that.unknownOption(parsed.unknown[0]);
        }

        //check required argument is missing
        that.args.forEach(function(arg, i){
            if (arg.required && null == args[i]) {
                that.missingArg(arg.name);
            }
        });

        fn.apply(this, args);

    });

    return this;
};
