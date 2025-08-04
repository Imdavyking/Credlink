import { useState } from "react";
import {
  tokens,
  credLinkThirdWeb,
  isNativeTokenAddressCred,
} from "../../utils/constants";
import TokenDropdown from "../../components/TokenDropdown";
import NumberInput from "../../components/NumberInput";
import SubmitButton from "../../components/SubmitButton";
import { toast } from "react-toastify";

import { useActiveAccount, useReadContract } from "thirdweb/react";
import {
  prepareContractCall,
  sendAndConfirmTransaction,
  toUnits,
} from "thirdweb";

export default function LockCollateral() {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: balance, isLoading: loadingBalance } = useReadContract({
    contract: credLinkThirdWeb,
    method:
      "function getUserBalance(address account, address token) view returns (uint256)",
    params: [
      address ?? "0x0000000000000000000000000000000000000000",
      selectedToken.address,
    ],
  });

  const handleLockCollateral = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsSubmitting(true);

      const trx = prepareContractCall({
        contract: credLinkThirdWeb,
        method: "function lockCollateral(address token, uint256 amount)",
        params: [selectedToken.address, toUnits(amount, 18)],
        value: isNativeTokenAddressCred(selectedToken.address)
          ? toUnits(amount, 18)
          : undefined,
      });

      await sendAndConfirmTransaction({
        transaction: trx,
        account: activeAccount,
      });

      toast.success("Collateral locked successfully");
      setAmount("");
    } catch (error) {
      console.error("Lock collateral error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Lock Collateral</h2>
      <form onSubmit={handleLockCollateral} className="space-y-4">
        <TokenDropdown
          label="Token"
          tokens={tokens}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          balance={
            loadingBalance
              ? "Loading..."
              : balance
              ? `${Number(balance) / 10 ** 18}`
              : "0"
          }
        />
        <NumberInput
          label="Amount"
          placeholder="1000"
          defaultValue={amount}
          onChange={(value) => setAmount(value)}
        />
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
}
