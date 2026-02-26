import { useEffect } from "react";
import { useNavigate } from "react-router";


/**
 * Legacy add-expense route. The actual form is now rendered inside a
 * dialog on the Expenses listing page. Users who navigate here should
 * be redirected to /expenses so the dialog can be opened from that
 * page instead.
 */
export function AddExpense() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard/expenses', { replace: true });
  }, [navigate]);
  return null;
}
