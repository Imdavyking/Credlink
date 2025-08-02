import { useState } from "react";
import { tokens, umixContract } from "../../utils/constants";
import { toast } from "react-toastify";

import SubmitButton from "../../components/SubmitButton";
import NumberInput from "../../components/NumberInput";
import TokenDropdown from "../../components/TokenDropdown";

import { useActiveAccount, useReadContract } from "thirdweb/react";
import {
  prepareContractCall,
  sendAndConfirmTransaction,
  toUnits,
} from "thirdweb";

export default function CreateLoan() {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: balanceData, isLoading: balanceLoading } = useReadContract({
    contract: umixContract,
    method:
      "function getUserBalance(address account, address token) view returns (uint256)",
    params: [
      address ?? "0x0000000000000000000000000000000000000000",
      selectedToken.address,
    ],
    // Alternatively, call directly from ERC20 if needed
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!duration || Number(duration) <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsSubmitting(true);

      const trx = prepareContractCall({
        contract: umixContract,
        method:
          "function createLoan(address token, uint256 amount, uint256 duration)",
        params: [selectedToken.address, toUnits(amount, 18), BigInt(duration)],
      });

      await sendAndConfirmTransaction({
        transaction: trx,
        account: activeAccount,
      });

      toast.success("Loan offer created successfully!");
      setAmount("");
      setDuration("");
    } catch (error) {
      console.error("Create loan error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Create Loan Offer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TokenDropdown
          label="Loan Token"
          tokens={tokens}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          balance={
            balanceLoading
              ? "Loading..."
              : balanceData
              ? `${Number(balanceData) / 10 ** 18}`
              : "0"
          }
        />

        <NumberInput
          defaultValue={duration}
          onChange={setDuration}
          label="Duration (in seconds)"
          placeholder="e.g., 604800"
        />

        <NumberInput
          defaultValue={amount}
          onChange={setAmount}
          label="Amount"
          placeholder="Enter Amount"
        />

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
}
