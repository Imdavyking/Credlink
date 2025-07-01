import { ethers, toBigInt } from "ethers";
import {
  getAccount,
  getFunction,
  publicClient,
  umixInterface,
  walletClient,
} from "../utils/config";

export const getUserBalance = async (
  account: `0x${string}`,
  token: `0x${string}`
): Promise<number> => {
  let userBalance = 0;

  if (token === ethers.ZeroAddress) {
    const client = publicClient();
    const balance = await client.getBalance({
      address: account,
    });
    userBalance = Number(balance) / 10 ** 18;
  }

  return userBalance;
};

export const getLiquidity = async ({
  lender,
  token,
}: {
  lender: `0x${string}`;
  token: `0x${string}`;
}) => {
  const { to, data } = await getFunction("liquidityPool", lender, token);
  const response = await publicClient().call({ to, data });
  if (!response.data) throw Error("No data found");
  if (typeof response.data == "string")
    throw Error("Data is not an array of bytes");
  const liquidity = toBigInt(new Uint8Array(response.data));

  return Number(liquidity) / 10 ** 18;
};

export const getCollaterial = async ({
  borrower,
  token,
}: {
  borrower: `0x${string}`;
  token: `0x${string}`;
}) => {
  const { to, data } = await getFunction("collateral", borrower, token);
  const response = await publicClient().call({ to, data });
  if (!response.data) throw Error("No data found");
  if (typeof response.data == "string")
    throw Error("Data is not an array of bytes");
  const collateral = toBigInt(new Uint8Array(response.data));
  return Number(collateral) / 10 ** 18;
};

export const getDebt = async ({
  borrower,
  token,
}: {
  borrower: `0x${string}`;
  token: `0x${string}`;
}) => {
  const { to, data } = await getFunction("debt", borrower, token);
  const response = await publicClient().call({ to, data });
  if (!response.data) throw Error("No data found");
  if (typeof response.data == "string")
    throw Error("Data is not an array of bytes");
  const debt = toBigInt(new Uint8Array(response.data));
  return Number(debt) / 10 ** 18;
};

export const createLoan = async ({
  token,
  amount,
  duration,
}: {
  token: `0x${string}`;
  amount: number;
  duration: bigint;
}) => {
  let value = 0n;
  let amountWithDecimals = 0n;
  if (token === ethers.ZeroAddress) {
    value = BigInt(Math.trunc(amount * 10 ** 18));
    amountWithDecimals = BigInt(Math.trunc(amount * 10 ** 18));
  } else {
    const ERC20_DECIMALS = 18; // TODO: get from contract
    amountWithDecimals = BigInt(Math.trunc(amount * 10 ** ERC20_DECIMALS));
  }

  const { to, data } = await getFunction(
    "createLoan",
    token,
    amountWithDecimals,
    duration
  );
  const hash = await walletClient().sendTransaction({
    account: await getAccount(),
    to,
    data,
    value,
  });
  const tx = await publicClient().waitForTransactionReceipt({ hash });
  revertOnError(tx);
};

export const acceptLoan = async ({
  lender,
  token,
  amount,
}: {
  lender: `0x${string}`;
  token: `0x${string}`;
  amount: number;
}) => {
  let amountToLoan = 0n;

  if (token === ethers.ZeroAddress) {
    amountToLoan = BigInt(Math.trunc(amount * 10 ** 18));
  } else {
    const ERC20_DECIMALS = 18; // TODO: get from contract
    amountToLoan = BigInt(amount * 10 ** ERC20_DECIMALS);
  }

  const { to, data } = await getFunction(
    "acceptLoan",
    lender,
    token,
    amountToLoan
  );
  const hash = await walletClient().sendTransaction({
    account: await getAccount(),
    to,
    data,
  });

  const tx = await publicClient().waitForTransactionReceipt({ hash });
  revertOnError(tx);
};

export const payLoan = async ({
  lender,
  token,
  amount,
}: {
  lender: `0x${string}`;
  token: `0x${string}`;
  amount: number;
}) => {
  let amountToPay = 0n;
  let value = 0n;

  if (token === ethers.ZeroAddress) {
    value = BigInt(Math.trunc(amount * 10 ** 18));
    amountToPay = BigInt(Math.trunc(amount * 10 ** 18));
  } else {
    const ERC20_DECIMALS = 18; // TODO: get from contract
    amountToPay = BigInt(Math.trunc(amount * 10 ** ERC20_DECIMALS));
  }

  const { to, data } = await getFunction("payLoan", token, lender, amountToPay);
  const hash = await walletClient().sendTransaction({
    account: await getAccount(),
    to,
    data,
    value,
  });

  const tx = await publicClient().waitForTransactionReceipt({ hash });
  revertOnError(tx);
};

export const lockCollateral = async ({
  token,
  amount,
}: {
  token: string;
  amount: number;
}) => {
  let amountToLock = 0n;

  let value = 0n;

  if (token === ethers.ZeroAddress) {
    value = BigInt(Math.trunc(amount * 10 ** 18));
    amountToLock = BigInt(Math.trunc(amount * 10 ** 18));
  } else {
    const ERC20_DECIMALS = 18; // TODO: get from contract
    amountToLock = BigInt(Math.trunc(amount * 10 ** ERC20_DECIMALS));
  }

  const { to, data } = await getFunction("lockCollateral", token, amountToLock);
  const hash = await walletClient().sendTransaction({
    account: await getAccount(),
    to,
    data,
    value,
  });
  const tx = await publicClient().waitForTransactionReceipt({ hash });
  revertOnError(tx);
};

const revertOnError = (tx: any) => {
  try {
    console.log(tx);
    if (!tx || !tx.status) {
      throw new Error("Transaction receipt is not available or invalid");
    }
    if (tx.status === "reverted") {
      const errorData = tx.logs[0]?.data;
      const errorMessage =
        errorData || "Transaction reverted without a message";
      if (errorData) {
        const fragment = umixInterface.fragments.filter((fragment) => {
          return fragment.type === "error";
        });
        console.log({ fragments: fragment });
        console.log(umixInterface.parseError(errorData));
      }
      throw new Error(`Transaction failed: ${errorMessage}`);
    }
    return tx;
  } catch (error) {
    console.error("Error occurred:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
