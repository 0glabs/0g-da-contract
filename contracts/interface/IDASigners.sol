// SPDX-License-Identifier: LGPL-3.0-only

pragma solidity >=0.8.0 <0.9.0;

import "../libraries/BN254.sol";

interface IDASigners {
    /*=== struct ===*/
    struct SignerDetail {
        address signer;
        string socket;
        BN254.G1Point pkG1;
        BN254.G2Point pkG2;
    }

    struct Params {
        uint tokensPerVote;
        uint maxVotesPerSigner;
        uint maxQuorums;
        uint epochBlocks;
        uint encodedSlices;
    }

    /*=== event ===*/
    event NewSigner(address indexed signer, BN254.G1Point pkG1, BN254.G2Point pkG2);
    event SocketUpdated(address indexed signer, string socket);

    /*=== function ===*/
    function params() external view returns (Params memory);

    function epochNumber() external view returns (uint);

    function quorumCount(uint _epoch) external view returns (uint);

    function isSigner(address _account) external view returns (bool);

    function getSigner(address[] memory _account) external view returns (SignerDetail[] memory);

    function getQuorum(uint _epoch, uint _quorumId) external view returns (address[] memory);

    function getQuorumRow(uint _epoch, uint _quorumId, uint32 _rowIndex) external view returns (address);

    function registerSigner(SignerDetail memory _signer, BN254.G1Point memory _signature) external;

    function updateSocket(string memory _socket) external;

    function registeredEpoch(address _account, uint _epoch) external view returns (bool);

    function registerNextEpoch(BN254.G1Point memory _signature) external;

    function getAggPkG1(
        uint _epoch,
        uint _quorumId,
        bytes memory _quorumBitmap
    ) external view returns (BN254.G1Point memory aggPkG1, uint total, uint hit);
}
