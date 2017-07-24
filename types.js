var MIN_OBJ_LENGTH = 3;
var MAX_OBJ_LENGTH = 4;
var TYPE = 2;
var NAME = 1;
var VIS = 0;

/**
 * If the value in dataArr is an array and dataArr's name doesn't contain brackets, brackets
 * are added to the name.
 */
function arrayCheckMod(dataArr, finalStr) {
    if (Array.isArray(dataArr[dataArr.length - 1] && !/\[.*?\]/.test(dataArr[NAME])) {
        finalStr += "[]";
        //for multidimens. arrays; it is assumed for now that the dimensions and their sizes are equivalent for all entries - may need helper function + recursion
        arrayCheckMod(dataArr[dataArr.length - 1][0], finalStr);
    }
}

/**
 * Generic function to create source code string
 */
function checkForVal(dataArr, finalStr) {
    if (dataArr[dataArr.length - 1] != null) {
        return finalStr + " " + finalStr[NAME] +  " = " + dataArr[dataArr.length - 1] + ";";
    } else {
        return finalStr + " " + finalStr[NAME] + ";";
    }
}

function makeBoolean(dataArr) {
    var boolStr = "bool";
    arrayCheckMod(dataArr, boolStr);
    boolStr += " " + dataArr[VIS];
    return checkForVal(dataArr, boolStr);
}

function makeInteger(dataArr) {
    var intStr;
    if (dataArr.length == MAX_OBJ_LENGTH && (dataArr[TYPE] == "uint" || dataArr[TYPE] == "unsigned integer")) {
        intStr = "uint";
    } else if (dataArr.length == MAX_OBJ_LENGTH) {
        intStr = "int";
    } else if (dataArr[dataArr.length - 1] > Math.pow(2, 256) - 1) { // if value can't fit
        intStr = "uint";
    } else {
        intStr = "int";
    }
    arrayCheckMod(dataArr, intStr);
    intStr += " " + intStr[VIS];
    return checkForVal(dataArr, intStr);    
}

function makeAddress(dataArr) {
    var adrStr = "address";
    arrayCheckMod(dataArr, adrStr);
    adrStr += " " + dataArr[VIS];
    if (dataArr[dataArr.length - 1] == "this" || checkChecksumAddress(dataArr[dataArr.length - 1]) {
        return adrStr + " "  + dataArr[NAME] + " = " + dataArr[dataArr.length - 1] + ";";
    } else {
        return adrStr + " "  + dataArr[NAME] + ";";
    }
}

function makeBytes(dataArr) {
    var byteStr;
    if (dataArr.length == MAX_OBJ_LENGTH && dataArr[TYPE] == 'fixed bytes') {
        byteStr = "bytes32";
    } else {
        byteStr = "bytes";
    }
    arrayCheckMod(dataArr, byteStr);
    byteStr += " " + dataArr[VIS];
    return checkForVal(dataArr, byteStr);
}

function makeString(dataArr) {
    // to handle hexadecimals prefixed with "hex" before string value
    if (dataArr[dataArr.length - 1].substr(0,2) == "hex") {
        dataArr[dataArr.length - 1] = dataArr[dataArr.length - 1].replace(/"/g,/"'"/);
    } 

    var stringStr = "string";
    arrayCheckMod(dataArr, stringStr);
    stringStr += " " + dataArr[VIS];
    if (dataArr[dataArr.length - 1] != null) {
        return stringStr + " " + dataArr[NAME] + " = " + "'" + dataArr[dataArr.length - 1] + "'" + ";";
    } else {
        return stringStr + " " + dataArr[NAME] + ";";
    }
}

function makeEnum(dataArr) {
    var enumStr = "enum";
    arrayCheckMod(dataArr, enumStr);
    enumStr += " " + dataArr[VIS];
    if (dataArr[dataArr.length - 1] != null) {
        return enumStr + " " + dataArr[NAME] + "{" + dataArr[dataArr.length - 1] + "}";
    } else {
        return enumStr + " " + dataArr[NAME] + "{}";
    }
}

/**
 * Checks if value is a possible Solidity type.
 */
function structInputCheck1(valToCheck) {
    valToCheck = valToCheck.replace(/\[.*?\]/g, '');
    return ["bool", "int", "uint", "address", "bytes", "bytes32", "string", "enum", "mapping"].includes(valToCheck);
}

/**
 * Checks if value is a possible Javascript type other than string, object, or function.
 */
function structInputCheck2(valToCheck) {
    //need to use previous style for arrays for now
    return ["number", "boolean"].includes(valToCheck);
}

/**
 * Javascript object must be in the format {name: Solidity type, ...} or
 * {name: Javascript type, ...} to be converted to structs.
 */
function makeStruct(dataArr) {
    var structStr = "struct " + dataArr[VIS] + " " + dataArr[NAME] + " {";
    if (Object.values(dataArr[dataArr.length - 1]).every(structInputCheck1) {
        Object.keys(dataArr[dataArr.length - 1]).forEach(function (key) {
            structStr += dataArr[dataArr.length - 1][key] + " " + key + ";";
        });
    } else if (Object.values(dataArr[dataArr.length - 1]).every(structInputCheck2) {
        Object.keys(dataArr[dataArr.length - 1]).forEach(function (key) {
            structStr += getAssgnStr(['', key, dataArr[dataArr.length - 1][key]);
        });
    }
    return structStr + "}";
}

/**
 * Javascript object must be in the format {type1: type2} to be converted to a mapping.
 */
function makeMapping(dataArr) {
    return "mapping(" + Object.keys(dataArr[dataArr.length - 1])[0] + " => " + Objects.values(dataArr[dataArr.length - 1])[0] + ") " + dataArr[VIS] + " " + dataArr[NAME] + ";";
}

function makeFunction(dataArr) {
    return dataArr[dataArr.length - 1];
}

function makeContractDatatype(dataArr) {
    return dataArr[dataArr.length - 1];
}
