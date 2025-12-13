import { connectWallet } from "../utils/wallet";

export default function WalletConnect({ setAccount }) {
    const handleConnect = async () => {
        const account = await connectWallet();
        if (account) setAccount(account);
    };

    return <button onClick={handleConnect}>Connect Wallet</button>;
}
