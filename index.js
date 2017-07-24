var source = require('./source.js');
var Web3 = require('web3');
var solc = require('solc');
var TestRPC = require('TestRPC');

var MIN_OBJ_LENGTH = 3;
var MAX_OBJ_LENGTH = 4;
var TYPE = 2;
var NAME = 1;
var VIS = 0;

/**
 * The Contract constructor. Possible formats for arrays in dataList include:
 * ['visibility','name','type',value], ['visibility','name','type'], ['visibility',
 * 'name',value]. "parents" and "children" are arrays of Contracts.
 */
var Contract = function(type, name, dataList, parents, children) {
    this.name = name;
    this._children = this.addChildren(children);
    this._dataList = dataList;
    this._parents = this.addParents(parents);
    this._type = this.setType(type);
    this._sourceCode = source.createContractSource(type, name, dataList, parents);
}

/**
 * Adds children contracts to this and adds this as parent contract 
 * to children.
 */
Contract.prototype.addChildren(children) {
    if (!this._children) {
        this._children = [];
    }
    for(var child in children) {
        if (child instanceof Contract) {
            this._children.push(child);
            if(!child.getParents().includes(this)) {
                child.addParents(this);
            }
        }
    }
}

Contract.prototype.getChildren() {
    return this._children;
}

/**
 * Adds parent contracts to this and adds this as child contract to parents.
 */
Contract.prototype.addParents(parents) {
    if (!this._parents) {
        this._parents = [];
    }
    for(var paren in parents) {
        if (paren instanceof Contract) {
            this._parents.push(paren);
            if(!paren.getChildren().includes(this)) {
                paren.addChildren(this);
            }
        }
    }
}

Contract.prototype.getParents() {
    return this._parents;
}

/**
 * Changes the type of the contract to contract, interface, or library, assuming the
 * contents of the contract match the type.
 */
Contract.prototype.setType = function(type) {
    if (type == "interface") {
        for(var dataArr in this._dataList) {
            if (!["function", "modifier"].includes(dataArr[TYPE]) || dataArr[NAME] 
                    == this.name) {} // do nothing
        }
    } else {
        this._type = type;
    }
}

/**
 * Adds an array to dataList if it's formatted correctly
 */
Contract.prototype.add = function(dataArr) {
    if (dataArr.length >= MIN_OBJ_LENGTH || dataArr.length <= MAX_OBJ_LENGTH &&
            ["external", "internal", "public", "private"].includes(dataArr[VIS]) &&
            typeof dataArr[NAME] == "string") {
        this._dataList.push(dataArr);
    }
}

/**
 * Resets dataList with new set of arrays
 */
Contract.prototype.setData = function(dataList) {
    this._dataList = [];
    for(var dataArr in dataList) {
        this.add(dataArr);
    }
}

/**
 * Removes the last array in dataList
 */
Contract.prototype.pop = function() {
    this._dataList.pop();
}

/**
 * Removes an array designated by name and/or type from dataList
 */
Contract.prototype.remove = function(name, type) {
    boolean found = false;
    for (var i = 0; i < this.dataList.length; i++) {
        if (arguments.length == 2 && this._dataList[i][NAME] == name && 
                this._dataList[i][TYPE] == type) {
            this._dataList.splice(i, 1);
            found = true;
        } else if (arguments.length == 1 && this._dataList[i][NAME] == name) {
            this._dataList.splice(i, 1);
            found = true;
        }
    }
    return found;
}

/**
 * Removes array at a specific index from dataList
 */
Contract.prototype.removeIndex = function(index) {
    this._dataList.splice(i, 1);
}

Contract.prototype.isEmpty = function() {
    return this._dataList.length == 0;
}

/**
 * Recreates source code of contract based on arrays in dataList
 */
Contract.prototype.updateSource = function() {
    this._sourceCode = createContract(this.type, this.name, this.dataList, this.parents, this.children);
}

Contract.prototype.getSource = function() {
    return this._sourceCode;
}

/**
 * Deploys contract to the TestRPC client. The source code is not updated before
 * deployment.
 */
Contract.prototype.deployNoUpdate = function() {
    var web3 = new Web3(TestRPC.provider());
    var input = this._sourceCode;
    var output = solc.compile(input, 1);
    var bytecode = output.contracts[this.name].bytecode;
    var abi = JSON.parse(output.contracts[this.name].interface);
    var contract = web3.eth.contract(abi);
    var deployedContract = contract.new({
        data: "0x" + bytecode,
        from: web3.eth.coinbase, // default mining reward location
        gas: 90000 //default value
    }, (err, res) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(res.transactionHash);
        if (res.address) {
            console.log('Contract address: ' + res.address);
        }
    });
}

/**
 * Deploys source code to TestRPC client after updating source code.
 */
Contract.prototype.deploy = function() {
    this.update();
    this.deployNoUpdate();
}

module.exports = Contract; // only Contract is exposed to module user
