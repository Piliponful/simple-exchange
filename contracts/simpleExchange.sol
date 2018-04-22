pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "./oraclizeAPI.sol";

contract simpleExchange is usingOraclize {
    DetailedERC20 BTC;
    DetailedERC20 USD;
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
        bool done;
    }

    Order[] orders;
    mapping (uint256=>Order) public ordersById;
    function getOrder(uint256 id) public view returns (address, uint256, string, string, uint256, uint256, bool, bool) {
        Order memory o = ordersById[id];
        return (o.who, id, o.from, o.to, o.amountTo, o.amountFrom, o.taken, o.done);
    }

    uint32 public fee;
    uint256 BtcToUsdExchangeRate;

    event PriceUpdate(string resultOfQuery);
    event LogNewOraclizeQuery(string description);
    event NewOrder(address account, uint256 orderId);
    event Log(string log);

    function simpleExchange(address _token1, address _token2, uint32 _fee) public payable {
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        BTC = DetailedERC20(_token1);
        USD = DetailedERC20(_token2);
        tokenByName["BTC"] = BTC;
        tokenByName["USD"] = USD;
        require(_fee <= 100);
        fee = _fee;
        updatePrice();
    }
    function getFee(uint256 whole, uint256 fee) public pure returns (uint256) {
        return whole / 100 * fee;
    }
    function createOrder(string fromName, string toName, uint256 toAmount) public validName(fromName, toName) returns (uint256) {
        require(toAmount > 0);
        uint256 fromAmount;
        if (keccak256(toName) == keccak256("BTC")) {
            fromAmount = toAmount * BtcToUsdExchangeRate + getFee(toAmount * BtcToUsdExchangeRate, fee);
        } else {
            fromAmount = toAmount / BtcToUsdExchangeRate + getFee(toAmount * BtcToUsdExchangeRate, fee);
        }
        currOrderId++;
        Order memory newOrder = Order(msg.sender, currOrderId, fromName, toName, toAmount, fromAmount, false, false);
        ordersById[currOrderId] = newOrder;
        NewOrder(msg.sender, newOrder.id);
        return newOrder.id;
    }
    function executeOrder(uint256 id) public returns (bool) {
        Order storage userOrder = ordersById[id];
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
            userOrder.done = true;
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

    function updatePrice() public payable returns (uint256) {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", "json(https://api.bitfinex.com/v1/pubticker/btcusd).mid");
        }
    }

    function __callback(bytes32 myid, string result) public {
        require(msg.sender == oraclize_cbAddress());
        BtcToUsdExchangeRate = parseInt(result);
        PriceUpdate(result);
        updatePrice();
    }
}
