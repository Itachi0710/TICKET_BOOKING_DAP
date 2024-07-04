// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

contract Migrations {
    // State variables
    address public owner = msg.sender; // Contract owner's address
    uint public last_completed_migration; // Last completed migration step

    // Modifier to restrict access to the owner only
    modifier restricted() {
        require(
            msg.sender == owner,
            "This function is restricted to the contract's owner"
        );
        _; // Continue execution
    }

    // Function to set the completed migration step
    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }
}
