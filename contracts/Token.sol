pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract Token is StandardToken, DetailedERC20 {
    function Token(string fullname, string symbol) DetailedERC20(name, symbol, 1) public {
    }
}
