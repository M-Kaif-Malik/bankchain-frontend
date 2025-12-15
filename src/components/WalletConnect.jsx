import { connectWallet } from "../utils/wallet";

export default function WalletConnect({ setAccount, setAccounts }) {
    const handleConnect = async () => {
        const accounts = await connectWallet();
        if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            if (setAccounts) setAccounts(accounts);
        }
    };

    return <button onClick={handleConnect}>Connect Wallet</button>;
}
