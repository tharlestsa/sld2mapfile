#! /usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import * as fs from 'fs';
import SldStyleParser from 'geostyler-sld-parser';

const argvs: any = yargs(hideBin(process.argv))
    .usage('The converter SLD file to Mapfile')
    .options({
        'sld': {
            description: "SLD's path to convert, .sld",
            required: true,
            alias: 's',
        },
        'table': {
            description: "Table Database",
            required: true,
            alias: 't',
        },
        'sldv': {
            description: "SLD version",
            default: '1.0.0',
            alias: 'sldv',
        }
    }).argv;

const sldString = fs.readFileSync(argvs.sld, 'utf8');
const sldParser = new SldStyleParser({sldVersion: argvs.sldv});
const getExpresstion = (expressionArray: any[]): string => { 
    let col, operator, value = '';
    if(Array.isArray(expressionArray)){
        if(typeof expressionArray[1] === 'string' || expressionArray[1] instanceof String){
            col = expressionArray[1].toLocaleLowerCase();
        } else{
            col = expressionArray[1]
        }

        operator = expressionArray[0]

        if(typeof expressionArray[2] === 'string' || expressionArray[2] instanceof String){
            value = `'${expressionArray[2]}'`;
        } else{
            value = expressionArray[2]
        }

    }
    return `[${col}] ${operator} ${value}` 
}

sldParser
  .readStyle(sldString)
  .then(({output: sldObject}) => {
    const style: any = sldObject; 
    let classes = ''
    style.rules.forEach(rule => { 
        let expression = ''; 
        if(rule.hasOwnProperty('filter')){

            const hasArray = rule.filter.some(item =>
                Array.isArray(item)
             );
             if(hasArray) {
                 expression = `${getExpresstion(rule.filter[1])} ${rule.filter[0] === '&&' ? 'AND' : rule.filter[0]} ${getExpresstion(rule.filter[2])}`
             } else {
                 expression = `${getExpresstion(rule.filter)}`
             }
    classes += `
    CLASS
        NAME  "${rule.name}"
        EXPRESSION (${expression})
        STYLE
            COLOR "${rule.symbolizers[0].color}"
            OUTLINECOLOR 255 255 255
        END
    END \n`;

        }

    });

const layer = `
LAYER
    NAME "${argvs.sld.replace("./","").replace(".sld","")}"
    CONNECTIONTYPE POSTGIS
    CONNECTION "host=<host> port=<port> dbname=<db> user=<username> password='<password>'"
    DATA "geom from (select * from ${argvs.table} where %MSFILTER%) as subquery using unique gid using srid=4674"
    EXTENT  -73.9916248 -34.0002454 -34.4168839 6.0000274
    PROCESSING "CLOSE_CONNECTION=DEFER"
    METADATA
        "ows_title" ""
        "ows_abstract" ""
        "gml_exclude_items" "geometry"
        "gml_include_items" "all"
        "gml_geometries"  "geometry"
    END
    PROJECTION
        "init=epsg:4674"
    END
    STATUS ON
    TYPE Polygon
    TEMPLATE "DUMMY"
    VALIDATION 
        "MSFILTER" "." 
        "DEFAULT_MSFILTER" "1=1"
    END
    ${classes}
END`;

    console.log(layer);
    
  })
  .catch(error => console.error(error));