import { useEffect, useState } from "react";
import { tokens, credLinkContract } from "../../utils/constants";
import TokenDropdown from "../../components/TokenDropdown";
import TextInput from "../../components/TextInput";
import NumberInput from "../../components/NumberInput";
import SubmitButton from "../../components/SubmitButton";
import { toast } from "react-toastify";

import { useActiveAccount, useReadContract } from "thirdweb/react";
import {
  prepareContractCall,
  sendAndConfirmTransaction,
  toUnits,
} from "thirdweb";

export default function PayLoan() {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;

  const [amount, setAmount] = useState("");
  const [selectedLoanToken, setSelectedLoanToken] = useState(tokens[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lender, setLender] = useState("");

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    contract: credLinkContract,
    method:
      "function getUserBalance(address account, address token) view returns (uint256)",
    params: [
      address ?? "0x0000000000000000000000000000000000000000",
      selectedLoanToken.address,
    ],
  });

  const { data: debt, isLoading: debtLoading } = useReadContract({
    contract: credLinkContract,
    method:
      "function debt(address borrower, address token) view returns (uint256)",
    params: [
      address ?? "0x0000000000000000000000000000000000000000",
      selectedLoanToken.address,
    ],
  });

  useEffect(() => {
    if (address) {
      setLender(address); // You can customize this if lender is different
    }
  }, [address]);

  const handlePayLoan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid repayment amount");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsSubmitting(true);

      const trx = prepareContractCall({
        contract: credLinkContract,
        method:
          "function payLoan(address token, address lender, uint256 amount)",
        params: [selectedLoanToken.address, lender, toUnits(amount, 18)],
      });

      await sendAndConfirmTransaction({
        transaction: trx,
        account: activeAccount,
      });

      toast.success("Loan repaid successfully!");
      setAmount("");
    } catch (error) {
      console.error("Error paying loan:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Pay Loan</h2>
      <form onSubmit={handlePayLoan} className="space-y-4">
        <TextInput
          label="Lender Address"
          defaultValue={lender}
          onChange={() => {}}
          placeholder="0xLender..."
          disabled
        />

        <TokenDropdown
          label="Repayment Token"
          tokens={tokens}
          selectedToken={selectedLoanToken}
          setSelectedToken={setSelectedLoanToken}
          balance={
            balanceLoading
              ? "Loading..."
              : balance
              ? `${Number(balance) / 10 ** 18}`
              : "0"
          }
        />

        <NumberInput
          label="Repayment Amount"
          placeholder="1000"
          defaultValue={amount}
          onChange={setAmount}
        />

        <TextInput
          label="Total Debt"
          placeholder="0"
          defaultValue={
            debtLoading
              ? "Loading..."
              : debt
              ? `${Number(debt) / 10 ** 18} ${selectedLoanToken.name}`
              : `0 ${selectedLoanToken.name}`
          }
          disabled
          onChange={() => {}}
        />

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
}
