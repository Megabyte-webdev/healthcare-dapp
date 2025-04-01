// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

contract HealthCare{
    address owner;

    struct Record{
        uint256 recordId;
        string recordName;
        string diagnosis;
        string treatment;
        uint256 timestamp;
    }

    mapping(uint256 => Record[]) private patientRecords;
    mapping(address => bool) private authorizedProviders;

    modifier onlyOwner(){
        require(msg.sender == owner, "Only Owner can perform this action");
        _;
    }

     modifier onlyAuthorizedProvider(){
        require(authorizedProviders[msg.sender], "Not an authorized provider");
        _;
    }
    constructor(){
        owner =msg.sender;
    }

    function getOwner() public onlyOwner view returns (address) {
        return owner;
    }
    function authorizedProvider(address provider) public onlyOwner{
        authorizedProviders[provider]= true;
    }

    function addRecord(uint256 patientId, string memory patientName, string memory diagnosis, string memory treatment ) public onlyAuthorizedProvider{
        uint256 recordId=patientRecords[patientId].length + 1;
        patientRecords[patientId].push(Record(recordId , patientName, diagnosis, treatment, block.timestamp));
    }

    function getPatientRecord(uint256 patientId) public onlyAuthorizedProvider view returns (Record[] memory){
        return patientRecords[patientId];
    }
}