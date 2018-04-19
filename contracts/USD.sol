pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract USD is StandardToken, DetailedERC20 {
    function USD(string fullname, string symbol, uint8 denominator, address alloc) DetailedERC20(fullname, symbol, denominator) public {
        totalSupply_ = 30000000000000000;
        balances[msg.sender] = totalSupply_ - (3000 * (decimals ** 10));
        balances[alloc] = 3000 * (decimals ** 10);
    }
}
