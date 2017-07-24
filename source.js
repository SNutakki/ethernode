var sha3 = require('crypto-js/sha3');
var types = require('./types.js');

var MIN_OBJ_LENGTH = 3;
var MAX_OBJ_LENGTH = 4;
var TYPE = 2;
var NAME = 1;
var VIS = 0;

/**
 * Contract source code is generated based on parameters. Possible formats
 * for arrays in dataList include: ['visibility','name','type',value],
 * ['visibility','name','type'], ['visibility','name',value]. "parents"
 * is an array of Contracts.
 */
function createContractSource(type, name, dataList, parents) {
    var parentsStr = '';
    if (parents) {
        parentsStr += " is ";
    for(var contr in parents) {
        parentsStr += contr.name + ", ";
    }
    parentsStr = parentsStr.slice(0, -2);
    var baseContract = [type + " " + name + parentsStr + " {", "}"];
    for(var dataArr in dataList) {
        var valToInsert;
        if (dataArr.length == MAX_OBJ_LENGTH) {
            valToInsert = checkDatatype(dataArr, TYPE);
        } else {
            valToInsert = getAssgnStr(dataArr);
        }
        baseContract.splice(baseContract.length - 1, 0, valToInsert);
    }
    return baseContract;
}

/**
 * Determines type represented by dataArr and gets corresponding source code
 */
function getAssgnStr(dataArr) {
    var assgnStr = '';
    var switchCond = typeof dataArr[dataArr.length - 1];
    if (["string", "number", "boolean", "object"].includes(dataArr[dataArr.length - 1])) {
        switchCond = dataArr[dataArr.length - 1];
        dataArr[dataArr.length - 1] = null;
    }
    switch(switchCond) {
        case 'string':
           assgnStr = determineStr(dataArr);
           break;
        case 'number':
           assgnStr = types.makeInteger(dataArr);
           break;
        case 'boolean':
           assgnStr = types.makeBoolean(dataArr);
           break;
        case 'object':
           assgnStr = determineObj(dataArr);
           break;
    }
    return assgnStr;
}

/**
 * Checks if given address is a valid address
 */
function checkChecksumAddress(address) {
    address = address.replace('0x','');
    var addrHash = sha3(address.toLowerCase());
    for (var i = 0; i < 40; i++) {
        if ((parseInt(addressHash[i], 16) > 7 && addresss[i].toUpperCase() !== address[i])
                || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase !== address[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Checks what type a string with no corresponding type represents
 */
function determineStr(dataArr) {
    var keyword = checkDatatype(dataArr, TYPE);
    if (keyword == false) {
        var enumRegex = /[^,]+/;
        var hexRegex = /[0-9A-Fa-f]{6}/g;
        if (emuRegex.test[MIN_OBJ_LENGTH]) {
            return types.makeEnum(dataArr);
        } else if (dataArr[MIN_OBJ_LENGTH].substr(0,8) == "function" 
                && dataArr[MIN_OBJ_LENGTH].slice(-1) == "}") {
            return types.makeFunction(dataArr);
        } else if (hexRegex.test(dataArr[MIN_OBJ_LENGTH] 
                    && checkChecksumAddress(dataArr[MIN_OBJ_LENGTH])) {
            return types.makeAddress(dataArr);
        } else {
            return types.makeString(dataArr);
        }
    } else {
        return keyword;
    }
}

/**
 * Calls function necessary to generate source code depending on type
 */
function checkDatatype(dataArr, typeIndex) {
    var dataType = dataArr[typeIndex];
    dataType = dataType.replace(/\[.*?\]/g, '');
    switch(dataType) {
        case 'bool':
        case 'boolean':
            return types.makeBoolean(dataArr);
            break;
        case 'int':
        case 'uint':
        case 'integer':
        case 'unsigned integer':
        case 'number':
            return types.makeInteger(dataArr);
            break;
        case 'address':
            return types.makeAddress(dataArr);
            break;
        case 'bytes':
        case 'fixed bytes':
        case 'dynamic bytes':
            return types.makeBytes(dataArr);
            break;
        case 'string':
        case 'hex':
        case 'hexadecimal':
            return types.makeString(dataArr);
            break;
        case 'enum':
            return types.makeEnum(dataArr);
            break;
        case 'object':
            return determineObj(dataArr):
            break;
        case 'struct':
            return types.makeStruct(dataArr);
            break;
        case 'mapping':
            return types.makeMapping(dataArr);
            break;
        case 'function':
        case 'modifier':
            return types.makeFunction(dataArr);
            break;
        case 'contract':
        case 'interface':
        case 'library':
            return types.makeContractDatatype(dataArr);
            break;
    } 
    return '';
}

/**
 * Checks if value is possible data type in a struct or can be converted to one
 */
function structInitCheck(valToCheck) {
    valToCheck = valToCheck.replace(/\[.*?\]/g, '');
    return ["bool", "int", "uint", "address", "bytes", "bytes32", "string", "enum", "mapping", "number", "boolean"].includes(valToCheck);
}

/**
 * Checks if value is possible data type for mapping key
 */
function mappingKeyCheck(valToCheck) {
    return ["bool", "int", "uint", "address", "bytes", "bytes32", "string"].includes(valToCheck);
}

/**
 * Checks if value is possible data type for mapping value
 */
function mappingValCheck(valToCheck) {
    valToCheck = valToCheck.replace(/\[.*?\]/g, '');
    return ["bool", "int", "uint", "address", "bytes", "bytes32", "string", "enum", "mapping", "struct", "contract"].includes(valToCheck);
}

/**
 * Determines the Solidity data type for a value of type 'object.' The value is invalid if
 * it can't be represented by a struct or mapping.
 */
function determineObj(dataArr) {
   if (Object.values(dataArr[dataArr.length - 1]).every(structInitCheck)) {
       return types.makeStruct(objArr);
   } else if (Object.keys(dataArr[dataArr.length - 1][1]).length == 1 && Object.keys(dataArr[dataArr.length - 1][1]).every(mappingKeyCheck) && Object.values(dataArr[dataArr.length - 1][1]).every(mappingValCheck)) {
       return types.makeMapping(objArr);
   }
}
