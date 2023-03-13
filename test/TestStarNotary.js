const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;
let instance;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

before(async () => {
    instance = await StarNotary.deployed();
});

it('can Create a Star', async() => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    // let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    // let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:10});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.isAbove(value, Number(starPrice));
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const tokenId = 6;
    await instance.createStar('Awesome Star 2!', tokenId, {from: accounts[0]});
    assert.equal(await instance.name(), 'Rocky Star Token');
    assert.equal(await instance.symbol(), 'RST');
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    const tokenId1 = 7;
    const tokenId2 = 8;
    const user1 = accounts[0];
    const user2 = accounts[1];
    await instance.createStar('Awesome Star 1!', tokenId1, {from: user1});
    await instance.createStar('Awesome Star 2!', tokenId2, {from: user2});
    await instance.exchangeStars(tokenId1, tokenId2, {from: user1});
    const newOwner1 = await instance.ownerOf(tokenId1);
    const newOwner2 = await instance.ownerOf(tokenId2);
    assert.equal(user1, newOwner2);
    assert.equal(user2, newOwner1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    const tokenId = 9;
    const user1 = accounts[0];
    const user2 = accounts[1];
    await instance.createStar('Awesome Star!', tokenId, {from: user1});
    await instance.transferStar(user2, tokenId, {from: user1});
    const newOwner = await instance.ownerOf(tokenId);
    assert.equal(user2, newOwner);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    const tokenId = 10;
    const user = accounts[0];
    await instance.createStar('Awesome Super Star!', tokenId, {from: user});
    const name = await instance.lookUptokenIdToStarInfo(tokenId);
    assert.equal(name, 'Awesome Super Star!');
});