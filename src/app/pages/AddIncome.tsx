import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Legacy add-income route. Redirects to income listing where dialog is
 * shown instead of separate page.
 */
export function AddIncome() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard/income', { replace: true });
  }, [navigate]);
  return null;
}
