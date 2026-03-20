// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgentPay RSK — Freelance Escrow
/// @notice Trustless RBTC escrow between a client and freelancer on Rootstock
contract Escrow {
    enum Status { Funded, Released, Refunded }

    struct EscrowJob {
        uint256 id;
        address payable client;
        address payable freelancer;
        uint256 amount;
        Status status;
        uint256 createdAt;
    }

    uint256 public escrowCount;
    mapping(uint256 => EscrowJob) public escrows;

    event EscrowCreated(uint256 indexed id, address indexed client, address indexed freelancer, uint256 amount);
    event EscrowReleased(uint256 indexed id, address indexed freelancer, uint256 amount);
    event EscrowRefunded(uint256 indexed id, address indexed client, uint256 amount);

    modifier onlyClient(uint256 _id) {
        require(msg.sender == escrows[_id].client, "Not the client");
        _;
    }

    modifier isFunded(uint256 _id) {
        require(escrows[_id].status == Status.Funded, "Escrow not in Funded state");
        _;
    }

    /// @notice Create a new escrow job — client sends RBTC, locked until release or refund
    function createEscrow(address payable _freelancer) external payable returns (uint256) {
        require(msg.value > 0, "Must deposit RBTC");
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_freelancer != msg.sender, "Client and freelancer must differ");

        uint256 id = escrowCount++;
        escrows[id] = EscrowJob({
            id: id,
            client: payable(msg.sender),
            freelancer: _freelancer,
            amount: msg.value,
            status: Status.Funded,
            createdAt: block.timestamp
        });

        emit EscrowCreated(id, msg.sender, _freelancer, msg.value);
        return id;
    }

    /// @notice Client releases funds to the freelancer after work is delivered
    function release(uint256 _id) external onlyClient(_id) isFunded(_id) {
        EscrowJob storage job = escrows[_id];
        job.status = Status.Released;
        job.freelancer.transfer(job.amount);
        emit EscrowReleased(_id, job.freelancer, job.amount);
    }

    /// @notice Client refunds themselves if work was not delivered
    function refund(uint256 _id) external onlyClient(_id) isFunded(_id) {
        EscrowJob storage job = escrows[_id];
        job.status = Status.Refunded;
        job.client.transfer(job.amount);
        emit EscrowRefunded(_id, job.client, job.amount);
    }

    /// @notice Get all escrows for a given client address
    function getEscrowsByClient(address _client) external view returns (EscrowJob[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < escrowCount; i++) {
            if (escrows[i].client == _client) count++;
        }
        EscrowJob[] memory result = new EscrowJob[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < escrowCount; i++) {
            if (escrows[i].client == _client) result[idx++] = escrows[i];
        }
        return result;
    }
}
