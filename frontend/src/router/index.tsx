import { useRoutes } from "react-router-dom";
import Home from "../views/home/main";
import NotFound from "../views/not-found/main";
import CreateLoan from "../views/create-loan/main";
import AcceptLoanForm from "../views/accept-loan/main";
import PayLoan from "../views/pay-loan/main";
import LockCollaterial from "../views/lock-collaterial/main";
import LenderLoanList from "../views/accept-loan/all";
import BorrowerLoanList from "../views/pay-loan/all";
function Router() {
  const routes = [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
    {
      path: "/create-loan",
      element: <CreateLoan />,
    },
    {
      path: "/accept-loan",
      element: <AcceptLoanForm />,
    },
    {
      path: "/available-loans",
      element: <LenderLoanList />,
    },
    {
      path: "/my-loans",
      element: <BorrowerLoanList />,
    },
    {
      path: "/pay-loan",
      element: <PayLoan />,
    },
    {
      path: "/lock-collateral",
      element: <LockCollaterial />,
    },
  ];
  return useRoutes(routes);
}

export default Router;
