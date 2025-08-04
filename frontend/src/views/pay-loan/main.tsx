import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  tokens,
  credLinkThirdWeb,
  isNativeTokenAddressCred,
} from "../../utils/constants";
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

  const [searchParams] = useSearchParams();
  const lenderFromQuery = searchParams.get("lender") || "";

  const [amount, setAmount] = useState("");
  const [selectedLoanToken, setSelectedLoanToken] = useState(tokens[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lender, setLender] = useState(lenderFromQuery);

  // Update lender if query param changes
  useEffect(() => {
    if (lenderFromQuery) {
      setLender(lenderFromQuery);
    }
  }, [lenderFromQuery]);

  // Update selected token if token param present
  const tokenFromQuery = searchParams.get("token");
  useEffect(() => {
    if (tokenFromQuery) {
      const tokenMatch = tokens.find(
        (t) => t.address.toLowerCase() === tokenFromQuery.toLowerCase()
      );
      if (tokenMatch) {
        setSelectedLoanToken(tokenMatch);
      }
    }
  }, [tokenFromQuery]);

  const amountFromQuery = searchParams.get("amount");
  useEffect(() => {
    if (amountFromQuery) {
      const parsedAmount = parseFloat(amountFromQuery);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        setAmount((parsedAmount / 10 ** 18).toString());
      }
    }
  }, [amountFromQuery]);

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    contract: credLinkThirdWeb,
    method:
      "function getUserBalance(address account, address token) view returns (uint256)",
    params: [
      address ?? "0x0000000000000000000000000000000000000000",
      selectedLoanToken.address,
    ],
  });

  const { data: debt, isLoading: debtLoading } = useReadContract({
    contract: credLinkThirdWeb,
    method:
      "function debt(address borrower, address token) view returns (uint256)",
    params: [
      address ?? "0x0000000000000000000000000000000000000000",
      selectedLoanToken.address,
    ],
  });

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

    if (!lender) {
      toast.error("Lender address not found");
      return;
    }

    try {
      setIsSubmitting(true);

      const trx = await prepareContractCall({
        contract: credLinkThirdWeb,
        method:
          "function payLoan(address token, address lender, uint256 amount)",
        params: [selectedLoanToken.address, lender, toUnits(amount, 18)],
        value: isNativeTokenAddressCred(selectedLoanToken.address)
          ? toUnits(amount, 18)
          : undefined,
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
          placeholder="0xLender..."
          disabled
          onChange={() => {}}
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
