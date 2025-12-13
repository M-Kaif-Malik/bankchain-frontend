export async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask not installed");
        return null;
    }

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });

    return accounts[0];
}
