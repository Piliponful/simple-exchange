pragma solidity 0.4.21;

import "./Token.sol";
import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "./Oraclize.sol";
import "./StringUtils.sol";

contract simpleExchange is usingOraclize {
    using strings for *;
    DetailedERC20 token1;
    DetailedERC20 token2;
    mapping(string => DetailedERC20) tokenByName;

    address admin;

    uint256 private currOrderId;
    struct Order {
        address who;
        uint256 id;
        string from;
        string to;
        uint256 amountTo;
        uint256 amountFrom;
        bool taken;
    }

    Order[] public orders;
    mapping (uint256=>Order) ordersById;

    uint32 public fee;
    uint32 highestBid;
    uint32 lowestAsk;
    string public resultOfQuery;
    event PriceUpdate(string resultOfQuery);
    event LogNewOraclizeQuery(string description);

    function simpleExchange(address _token1, address _token2, uint32 _fee) public {
        token1 = DetailedERC20(_token1);
        token2 = DetailedERC20(_token2);
        // string token1Name = token1.name();
        // string token2Name = token2.name();
        tokenByName["BTC"] = token1;
        tokenByName["USD"] = token2;
        require(_fee <= 100);
        fee = _fee;
        getPrice();
    }
    function getFee(uint256 whole, uint256 fee) public pure returns (uint256) {
        return fee * 100 / whole;
    }
    function getPrice() public payable {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", "json(https://api.bitfinex.com/v2/ticker/tBTCUSD");
        }
    }
    function buyOrder(string fromName, string toName, uint256 toAmount) public validName(fromName, toName) returns (uint256) {
        require(toAmount > 0);
        currOrderId++;
        Order memory newOrder = Order(msg.sender, currOrderId, fromName, toName, toAmount, lowestAsk + this.fee(), false);
        ordersById[currOrderId] = newOrder;
        return newOrder.id;
    }
    function __callback(bytes32 myid, string result) public {
        if (msg.sender != oraclize_cbAddress()) throw;
        var s = result.toSlice();
        resultOfQuery = s.beyond("[".toSlice()).until("]".toSlice()).toString();
        strings.slice memory part;
        s.split(",".toSlice());
        s.split(",".toSlice(), part);
        highestBid = stringToUint(part.toString());
        s.split(",".toSlice());
        s.split(",".toSlice());
        s.split(",".toSlice(), part);
        lowestAsk = stringToUint(part.toString());
        getPrice();
    }
    function buy(uint256 id) public returns (bool) {
        Order userOrder = ordersById[id];
        ERC20 sellToken = tokenByName[userOrder.from];
        ERC20 buyToken = tokenByName[userOrder.to];
        if (sellToken.allowance(msg.sender, address(this)) >= ordersById[id].amountFrom) {
            buyToken.transferFrom(msg.sender, this, userOrder.amountFrom);
            userOrder.taken = true;
        } else {
            if (userOrder.taken != true) {
                revert();
            }
        }
        if (buyToken.balanceOf(this) >= userOrder.amountTo) {
            sellToken.transfer(userOrder.who, userOrder.amountTo);
            return true;
        }
        return false;
    }
    // function sell(string tokenName, uint256 amount) public validName(tokenName) {

    // }
    modifier validName(string firstTokenName, string secondTokenName) {
        require(
            keccak256(firstTokenName) != keccak256(secondTokenName)
            && address(tokenByName[firstTokenName]) != address(0)
            && address(tokenByName[secondTokenName]) != address(0));
        _;
    }

    function stringToUint(string s) public pure returns (uint32 result) {
        bytes memory b = bytes(s);
        uint32 i;
        result = 0;
        for (i = 0; i < b.length; i++) {
            uint32 c = uint32(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
    }
}