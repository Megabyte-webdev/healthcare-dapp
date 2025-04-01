import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "./constants";

const HealthCare = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(null);
  const [networkName, setNetworkName] = useState(null);

  // Form states
  const [providerAddress, setProviderAddress] = useState("");
  const [patientID, setPatientID] = useState("");
  const [patientRecords, setPatientRecords] = useState(null);
  const [newPatientID, setNewPatientID] = useState("");
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  // Loading states
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask or a Web3 wallet is required. Please install it.");
      return;
    }

    setIsConnecting(true);
    try {
      const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
      await providerInstance.send("eth_requestAccounts", []);
      const signerInstance = providerInstance.getSigner();
      setProvider(providerInstance);
      setSigner(signerInstance);

      const accountAddress = await signerInstance.getAddress();
      setAccount(accountAddress);

      const network = await providerInstance.getNetwork();
      setNetworkName(network.name || `Chain ID: ${network.chainId}`);

      const contractInstance = new ethers.Contract(contractAddress, contractABI, signerInstance);
      setContract(contractInstance);

      const ownerAddress = await contractInstance.getOwner();
      setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    connectWallet();
  }, [provider]);

  const authorizeProvider = async () => {
    if (!contract) return;
    setIsAuthorizing(true);
    try {
      const tx = await contract.authorizedProvider(providerAddress);
      await tx.wait();
      alert("Provider authorized successfully!");
    } catch (error) {
      console.error("Authorization error:", error);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const fetchPatientRecords = async () => {
    if (!contract) return;
    setIsFetching(true);
    try {
      const record = await contract.getPatientRecord(patientID);
      if (record && record.length > 0) {
        const formattedRecord = {
          recordId: record[0][0].toNumber(),
          recordName: record[0][1],
          diagnosis: record[0][2],
          treatment: record[0][3],
          timestamp: new Date(record[0][4].toNumber() * 1000).toLocaleString()
        };
        setPatientRecords(formattedRecord);
      } else {
        setPatientRecords(null);
      }
    } catch (error) {
      console.error("Error fetching patient records:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const addPatientRecord = async () => {
    if (!contract) return;
    setIsAdding(true);
    try {
      const tx = await contract.addRecord(newPatientID, patientName, diagnosis, treatment);
      await tx.wait();
      alert("Patient record added successfully!");
      setNewPatientID("");
      setPatientName("");
      setDiagnosis("");
      setTreatment("");
    } catch (error) {
      console.error("Error adding patient record:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container">
      <h1>Health Care DApp</h1>

      {window.ethereum ? (
        <>
          {account ? (
            <>
              <p><strong>Connected Wallet:</strong> {account}</p>
              {networkName &&<p><strong>Network:</strong> {networkName}</p>}
              {isOwner && <p>You are the contract owner</p>}

              {/* Fetch Patient Records */}
              <div className="form">
                <h2>Fetch Patient Records</h2>
                <input
                  type="text"
                  placeholder="Enter Patient ID"
                  value={patientID}
                  onChange={(e) => setPatientID(e.target.value)}
                />
                <button onClick={fetchPatientRecords} disabled={isFetching}>
                  {isFetching ? "Fetching..." : "Fetch Records"}
                </button>
                {patientRecords ? (
                  <div>
                    <h3>Patient Record</h3>
                    <p><strong>Record ID:</strong> {patientRecords.recordId}</p>
                    <p><strong>Name:</strong> {patientRecords.recordName}</p>
                    <p><strong>Diagnosis:</strong> {patientRecords.diagnosis}</p>
                    <p><strong>Treatment:</strong> {patientRecords.treatment}</p>
                    <p><strong>Timestamp:</strong> {patientRecords.timestamp}</p>
                  </div>
                ) : (
                  <p>No record found for the provided ID.</p>
                )}
              </div>

              {/* Add Patient Record */}
              <div className="form">
                <h2>Add Patient Record</h2>
                <input
                  type="text"
                  placeholder="Enter Patient ID"
                  value={newPatientID}
                  onChange={(e) => setNewPatientID(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Enter Patient Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Treatment"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                />
                <button onClick={addPatientRecord} disabled={isAdding}>
                  {isAdding ? "Adding..." : "Add Patient Record"}
                </button>
              </div>

              {/* Authorize Provider */}
              <div className="form">
                <h2>Authorize HealthCare Provider</h2>
                <input
                  type="text"
                  placeholder="Provider Address"
                  value={providerAddress}
                  onChange={(e) => setProviderAddress(e.target.value)}
                />
                <button onClick={authorizeProvider} disabled={isAuthorizing}>
                  {isAuthorizing ? "Authorizing..." : "Authorize Provider"}
                </button>
              </div>
            </>
          ) : (
            <button onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </>
      ) : (
        <p style={{ color: "red" }}>
          MetaMask or another Web3 wallet is required. Please install it to use this application.
        </p>
      )}
    </div>
  );
};

export default HealthCare;
