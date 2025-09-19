import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function EnhancedDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to guest analysis since authentication is removed
    navigate('/guest-analysis');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">Taking you to the business analysis page.</p>
      </div>
    </div>
  );
}