pragma solidity ^0.4.18;

import "./Token.sol";
import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "./oraclizeAPI.sol";

contract simpleExchange is usingOraclize {
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
    uint256 exchangeRate;

    event PriceUpdate(string resultOfQuery);
    event LogNewOraclizeQuery(string description);

    function simpleExchange(address _token1, address _token2, uint32 _fee) public payable {
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        token1 = DetailedERC20(_token1);
        token2 = DetailedERC20(_token2);
        tokenByName["BTC"] = token1;
        tokenByName["USD"] = token2;
        require(_fee <= 100);
        fee = _fee;
        updatePrice();
    }
    function getFee(uint256 whole, uint256 fee) public pure returns (uint256) {
        return fee * 100 / whole;
    }
    function updatePrice() public payable returns (uint256) {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", "json(https://api.bitfinex.com/v2/ticker/tBTCUSD).0", "ccy1=BTC&ccy2=USD");
        }
    }
    function buyOrder(string fromName, string toName, uint256 toAmount) public validName(fromName, toName) returns (uint256) {
        require(toAmount > 0);
        currOrderId++;
        Order memory newOrder = Order(msg.sender, currOrderId, fromName, toName, toAmount, toAmount * exchangeRate + getFee(toAmount * exchangeRate, fee), false);
        ordersById[currOrderId] = newOrder;
        return newOrder.id;
    }
    function __callback(bytes32 myid, string result) public {
        require(msg.sender == oraclize_cbAddress());
        exchangeRate = parseInt(result);
        PriceUpdate(result);
        updatePrice();
    }
    function executeBuyOrder(uint256 id) public returns (bool) {
        Order userOrder = ordersById[id];
        require(userOrder.who == msg.sender);
        ERC20 fromToken = tokenByName[userOrder.from];
        ERC20 toToken = tokenByName[userOrder.to];
        if (fromToken.allowance(msg.sender, address(this)) >= ordersById[id].amountFrom) {
            fromToken.transferFrom(msg.sender, this, userOrder.amountFrom);
            userOrder.taken = true;
        } else {
            if (userOrder.taken != true) {
                revert();
            }
        }
        if (toToken.balanceOf(this) >= userOrder.amountTo) {
            toToken.transfer(userOrder.who, userOrder.amountTo);
            return true;
        }
        return false;
    }

    modifier validName(string firstTokenName, string secondTokenName) {
        require(
            keccak256(firstTokenName) != keccak256(secondTokenName)
            && address(tokenByName[firstTokenName]) != address(0)
            && address(tokenByName[secondTokenName]) != address(0));
        _;
    }
}