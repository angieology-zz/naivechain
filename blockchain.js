

/*
Contructor for a 'block' copied from the definition. Can refer to block diagram
the hash of the previous block is the link that creates the chain
it 'preserves chain integrity'
 */
class Block {
    constructor(index, timestamp, prevHash, data, hash) {
        this.index = index;
        this.timestamp = timestamp;
        this.prevHash = prevHash.toString();
        this.data = data;
        this.hash = hash.toString();
    }
}

/*
Blockchain must be secure, since its value lies in not being duplicable.
Hash encryption technology used is the SHA-256
it will simply hash all values unique to this block
this method takes in all parameters in a block class except 'hash' which will be the output
 */

var createBlockHash = (index, timestamp, prevHash, data) => {
    return CryptoJS.SHA265(index + timestamp + prevHash + data).toString();
}

/*
Create a block - generate the rest of the fields
index is just the next
data of the block should be provided by user (this may be state, value in account etc.)
timestamp is time now
I called this current block, as input block is 'previous' block
 */

var generateCurrentBlock = (userBlockData) => {
    var previousBlock = getLatestBlock();
    var curIndex = previousBlock.index + 1;
    var curTimeStamp = new Date().getTime() / 1000;
    var curHash = createBlockHash(curIndex, curTimeStamp, previousBlock.hash, userBlockData);
    return new Block(curIndex, curTimeStamp, previousBlock.hash, userBlockData, curHash );
}

/*
As you can see, the generation of a new block is very minimal, it will simply create a new hash
I noticed that there is access to the blockchain itself, so it must be stored in memory
it is stored in an array
the first block is called the 'genesis' and is hard coded
 */
var getFirstBlock = () => {
    return new Block("0" ,123123123, "123123efg123123123dfs123123dfsd", "this is the genesis block, first!");
}
/*
now we can create the blockchain itself
 */

var blockchain = [getFirstBlock()];

/*
in a peer 2 peer network, user may receive blocks not created by themselves
they need to check the integrity of block. 
I think user will have access to the previously accepted blocks of the chain
 */

var isValidNewBlock = (newBlock, previousBlock) => {
    //check order of index (by whatever indexing rule is applicable)
    if(previousBlock.index + 1 !== newBlock.index){
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) { //this is a link error
        console.log('invalid previousHash');
        return false;
    } else if (createBlockHash(newBlock) !== newBlock.hash) {//check apply hashing algorithm 
        console.log('invalid hash: actual ' + newBlock.hash + ' does not match expected ' + createBlockHash(newBlock));
        return false;
    }
    return true;
}

/*
From the Saitoshi Nakamoto Whitepaper I read on blockchain (highly recommend for the basics)
one of the built-in security mechanisms is that the valid chain is the longest. 
The blockchain is uncorrupted as long as the longest chain is 'honest,' and there is incentive for it to always be so, 
if you read the paper

in a race condition where two blocks have the same index, the network will store both, 
then wait until the next block is generated and measure the longest chain at that time, discarding the shorter

 */
//method takes in a blockchain
var chooseLongestChain = (receivedNewChain) => {
    //the isValidChain will run isValidNewBlock on each pair of block on array
    if (isValidChain(receivedNewChain) && recievedNewChain.length > blockchain.length) {
        console.log('Received blockchain is valid and the longest. Replacing current with received');
        blockchain = recievedNewChain;
        broadcast(responseLateMsg());//lets other nodes in network know which is latest real chain
    } else {
        console.log('Received blockchain is invalid or shorter than current. No action taken');
    }
}
/*
the broadcast step is communication with other nodes
keeps the network in sync across nodes (users)
set up http server to control communication of the user's node to the other blocks 
 */
var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());
    //user can list all blocks
    app.get('/blocks/', (req, res) => res.send(JSON.stringify(blockchain)));
    //user can create a new block with content given by user
    app.post('/mineBlock', (req, res) => {
        var newBlock = generateCurrentBlock(req.body.data);
        addBlock(newBlock);
        broadcast(responseLatestMsg());
        console.log('block ' + JSON.stringify(newBlock) + ' was added');
        res.send();
    });
    //user can list peers
    app.get('/peers', (req, res) => {
        //socket creates two-way connection that can listen to each other
        //this is actually a second server that allows peer 2 peer communication
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    //user can add peers
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
}
/*
the node has 2 web servers
one for user to control node (http server)
another for peer 2 peer communication between nodes (websocket http server)
 */

/*
missing/next: mining algorithm (proof of work/ proof of stake)
 */