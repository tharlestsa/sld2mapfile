#! /usr/bin/env node
"use strict";
exports.__esModule = true;
var yargs_1 = require("yargs");
var helpers_1 = require("yargs/helpers");
var fs = require("fs");
var geostyler_sld_parser_1 = require("geostyler-sld-parser");
var argvs = (0, yargs_1["default"])((0, helpers_1.hideBin)(process.argv))
    .usage('The converter SLD file to Mapfile')
    .options({
    'sld': {
        description: "SLD's path to convert, .sld",
        required: true,
        alias: 's'
    },
    'table': {
        description: "Table Database",
        required: true,
        alias: 't'
    },
    'sldv': {
        description: "SLD version",
        "default": '1.0.0',
        alias: 'sldv'
    }
}).argv;
var sldString = fs.readFileSync(argvs.sld, 'utf8');
var sldParser = new geostyler_sld_parser_1["default"]({ sldVersion: argvs.sldv });
var getExpresstion = function (expressionArray) {
    var col, operator, value = '';
    if (Array.isArray(expressionArray)) {
        if (typeof expressionArray[1] === 'string' || expressionArray[1] instanceof String) {
            col = expressionArray[1].toLocaleLowerCase();
        }
        else {
            col = expressionArray[1];
        }
        operator = expressionArray[0];
        if (typeof expressionArray[2] === 'string' || expressionArray[2] instanceof String) {
            value = "'".concat(expressionArray[2], "'");
        }
        else {
            value = expressionArray[2];
        }
    }
    return "[".concat(col, "] ").concat(operator, " ").concat(value);
};
sldParser
    .readStyle(sldString)
    .then(function (_a) {
    var sldObject = _a.output;
    var style = sldObject;
    var classes = '';
    style.rules.forEach(function (rule) {
        var expression = '';
        if (rule.hasOwnProperty('filter')) {
            var hasArray = rule.filter.some(function (item) {
                return Array.isArray(item);
            });
            if (hasArray) {
                expression = "".concat(getExpresstion(rule.filter[1]), " ").concat(rule.filter[0] === '&&' ? 'AND' : rule.filter[0], " ").concat(getExpresstion(rule.filter[2]));
            }
            else {
                expression = "".concat(getExpresstion(rule.filter));
            }
            classes += "\n    CLASS\n        NAME  \"".concat(rule.name, "\"\n        EXPRESSION (").concat(expression, ")\n        STYLE\n            COLOR \"").concat(rule.symbolizers[0].color, "\"\n            OUTLINECOLOR 255 255 255\n        END\n    END \n");
        }
    });
    var layer = "\nLAYER\n    NAME \"".concat(argvs.sld.replace("./", "").replace(".sld", ""), "\"\n    CONNECTIONTYPE POSTGIS\n    CONNECTION \"host=<host> port=<port> dbname=<db> user=<username> password='<password>'\"\n    DATA \"geom from (select * from ").concat(argvs.table, " where %MSFILTER%) as subquery using unique gid using srid=4674\"\n    EXTENT  -73.9916248 -34.0002454 -34.4168839 6.0000274\n    PROCESSING \"CLOSE_CONNECTION=DEFER\"\n    METADATA\n        \"ows_title\" \"\"\n        \"ows_abstract\" \"\"\n        \"gml_exclude_items\" \"geometry\"\n        \"gml_include_items\" \"all\"\n        \"gml_geometries\"  \"geometry\"\n    END\n    PROJECTION\n        \"init=epsg:4674\"\n    END\n    STATUS ON\n    TYPE Polygon\n    TEMPLATE \"DUMMY\"\n    VALIDATION \n        \"MSFILTER\" \".\" \n        \"DEFAULT_MSFILTER\" \"1=1\"\n    END\n    ").concat(classes, "\nEND");
    console.log(layer);
})["catch"](function (error) { return console.error(error); });
