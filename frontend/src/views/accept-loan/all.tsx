import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { tokens } from "../../utils/constants";

const PAGE_SIZE = 10;

const GET_LOANS = gql`
  query GetLoans($first: Int!, $skip: Int!) {
    lenderLiquidityUpdateds(
      first: $first
      skip: $skip
      where: { availableAmount_gt: "0" }
    ) {
      id
      lender
      token
      availableAmount
    }
  }
`;

function formatAddress(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatToken(address: string) {
  const match = tokens.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
  return match ? match.name : "Unknown";
}

function formatAmount(amount: string) {
  const num = Number(amount) / 1e18;
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function LoanList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const offset = (page - 1) * PAGE_SIZE;

  const { loading, error, data, refetch } = useQuery(GET_LOANS, {
    variables: { first: PAGE_SIZE, skip: offset },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    refetch({ first: PAGE_SIZE, skip: offset });
  }, [page, offset, refetch]);

  const loans = data?.lenderLiquidityUpdateds ?? [];
  const totalCount = data?.lenderLiquidityUpdatedsConnection?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">
        Available Loan Offers
      </h2>

      {loading && (
        <p className="text-center text-gray-500">Loading loan offers...</p>
      )}
      {error && (
        <p className="text-center text-red-500">Error loading loans.</p>
      )}

      {!loading && loans.length === 0 && (
        <p className="text-gray-600">No available loans at the moment.</p>
      )}

      {loans.map((loan: any) => (
        <div
          key={loan.id}
          className="border border-gray-200 shadow-sm p-4 rounded-md bg-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Lender</p>
              <p className="font-mono text-gray-800">
                {formatAddress(loan.lender)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Token</p>
              <p className="text-gray-800">{formatToken(loan.token)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-green-600 font-semibold">
                {formatAmount(loan.availableAmount)}
              </p>
            </div>

            <Link
              to={`/accept-loan?lender=${loan.lender}&token=${loan.token}`}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
            >
              Accept Loan
            </Link>
          </div>
        </div>
      ))}

      <div className="flex justify-center space-x-4 mt-6">
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>

        <span className="text-gray-700 self-center">
          Page {page} of {totalPages}
        </span>

        <button
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
