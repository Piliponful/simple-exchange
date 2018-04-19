pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract BTC is StandardToken, DetailedERC20 {
    function BTC(string fullname, string symbol, uint8 decimals, address alloc) DetailedERC20(fullname, symbol, decimals) public {
        totalSupply_ = 30000000000000000;
        balances[msg.sender] = totalSupply_ - (3000 * (decimals ** 10));
        balances[alloc] = 3000 * (decimals ** 10);
    }
}
