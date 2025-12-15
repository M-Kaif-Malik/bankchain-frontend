export async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask not installed");
        return null;
    }

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });

    // Return full list so the dApp can show other connected accounts
    return accounts;
}
