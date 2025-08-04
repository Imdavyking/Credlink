import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { tokens, credLinkThirdWeb } from "../../utils/constants";
import TokenDropdown from "../../components/TokenDropdown";
import TextInput from "../../components/TextInput";
import NumberInput from "../../components/NumberInput";
import SubmitButton from "../../components/SubmitButton";
import { toast } from "react-toastify";

import { useActiveAccount, useReadContract } from "thirdweb/react";
import { prepareContractCall, sendAndConfirmTransaction } from "thirdweb";

interface Token {
  name: string;
  address: string;
  image: string;
}

export default function AcceptLoanForm() {
  const [searchParams] = useSearchParams();

  const activeAccount = useActiveAccount(); // Connected user
  const address = activeAccount?.address;

  const lenderFromQuery = searchParams.get("lender") || "";
  const tokenFromQuery = searchParams.get("token") || "";
  const amountFromQuery = searchParams.get("amount") || "";

  const [amount, setAmount] = useState("");
  const [selectedLoanToken, setSelectedLoanToken] = useState<Token>(tokens[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lender, setLender] = useState<string>("");

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

  useEffect(() => {
    if (amountFromQuery) setAmount(`${Number(amountFromQuery) / 10 ** 18}`);
  }, [amountFromQuery]);

  useEffect(() => {
    if (lenderFromQuery) {
      setLender(lenderFromQuery);
    } else if (address) {
      setLender(address);
    }
  }, [lenderFromQuery, address]);

  const { data: collateral, isLoading: collateralLoading } = useReadContract({
    contract: credLinkThirdWeb,
    method:
      "function collateral(address borrower, address token) view returns (uint256)",
    params: [
      address ?? "0x0000000000000000000000000000000000000000",
      selectedLoanToken.address,
    ],
  });

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    contract: credLinkThirdWeb,
    method:
      "function liquidityPool(address lender, address token) view returns (uint256)",
    params: [
      lender || "0x0000000000000000000000000000000000000000",
      selectedLoanToken.address,
    ],
  });

  const handleAcceptLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsSubmitting(true);

      const trx = prepareContractCall({
        contract: credLinkThirdWeb,
        method:
          "function acceptLoan(address lender, address token, uint256 amount)",
        params: [
          lender,
          selectedLoanToken.address,
          BigInt(Math.trunc(Number(amount) * 10 ** 18)),
        ],
      });

      await sendAndConfirmTransaction({
        transaction: trx,
        account: activeAccount,
      });

      toast.success("Loan accepted successfully!");
    } catch (error) {
      console.error("Error accepting loan:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Accept Loan</h2>
      <form onSubmit={handleAcceptLoan} className="space-y-4">
        <TextInput
          defaultValue={lender}
          onChange={() => {}}
          placeholder="0xLender..."
          label="Lender Address"
          disabled
        />
        <TokenDropdown
          label="Loan Token"
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
          label="Loan Amount"
          placeholder="1000"
          defaultValue={amount}
          onChange={(value) => setAmount(value)}
        />
        <TextInput
          label="Collateral"
          placeholder="0"
          defaultValue={
            collateralLoading
              ? "Loading..."
              : collateral
              ? `${Number(collateral) / 10 ** 18} ${selectedLoanToken.name}`
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
