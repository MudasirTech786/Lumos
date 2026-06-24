import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const STALE = {
  kpis: 30 * 1000,
  productions: 30 * 1000,
  alerts: 15 * 1000,
  financeTrend: 5 * 60 * 1000,
  assets: 60 * 1000,
  qrActivity: 15 * 1000,
  invoices: 30 * 1000,
  crewOperations: 30 * 1000,
};

function useKpis() {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: () => api.get("/dashboard/kpis").then((r) => r.data),
    staleTime: STALE.kpis,
  });
}

function useProductions() {
  return useQuery({
    queryKey: ["dashboard", "productions"],
    queryFn: () => api.get("/dashboard/productions").then((r) => r.data),
    staleTime: STALE.productions,
  });
}

function useAlerts() {
  return useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: () => api.get("/dashboard/alerts").then((r) => r.data),
    staleTime: STALE.alerts,
  });
}

function useFinanceTrend() {
  return useQuery({
    queryKey: ["dashboard", "financeTrend"],
    queryFn: () => api.get("/dashboard/finance-trend").then((r) => r.data),
    staleTime: STALE.financeTrend,
  });
}

function useAssets() {
  return useQuery({
    queryKey: ["dashboard", "assets"],
    queryFn: () => api.get("/dashboard/assets").then((r) => r.data),
    staleTime: STALE.assets,
  });
}

function useQrActivity() {
  return useQuery({
    queryKey: ["dashboard", "qrActivity"],
    queryFn: () => api.get("/dashboard/qr-activity").then((r) => r.data),
    staleTime: STALE.qrActivity,
  });
}

function useInvoices() {
  return useQuery({
    queryKey: ["dashboard", "invoices"],
    queryFn: () => api.get("/dashboard/invoices").then((r) => r.data),
    staleTime: STALE.invoices,
  });
}

function useCrewOperations() {
  return useQuery({
    queryKey: ["dashboard", "crewOperations"],
    queryFn: () => api.get("/dashboard/crew-operations").then((r) => r.data),
    staleTime: STALE.crewOperations,
  });
}

export function useDashboard() {
  const kpis = useKpis();
  const productions = useProductions();
  const alerts = useAlerts();
  const finance = useFinanceTrend();
  const assets = useAssets();
  const qr = useQrActivity();
  const invoices = useInvoices();
  const crew = useCrewOperations();

  const isLoading =
    kpis.isLoading ||
    productions.isLoading ||
    alerts.isLoading ||
    finance.isLoading ||
    assets.isLoading ||
    qr.isLoading ||
    invoices.isLoading ||
    crew.isLoading;

  const isRefetching =
    kpis.isRefetching ||
    productions.isRefetching ||
    alerts.isRefetching ||
    finance.isRefetching ||
    assets.isRefetching ||
    qr.isRefetching ||
    invoices.isRefetching ||
    crew.isRefetching;

  const isError =
    kpis.isError ||
    productions.isError ||
    alerts.isError ||
    finance.isError ||
    assets.isError ||
    qr.isError ||
    invoices.isError ||
    crew.isError;

  const queries = [kpis, productions, alerts, finance, assets, qr, invoices, crew];

  const refetchCount = queries.filter((q) => q.isRefetching).length;

  const refetchAll = async () => {
    await Promise.all(queries.map((q) => q.refetch()));
  };

  return {
    kpis: kpis.data,
    productions: productions.data,
    alerts: alerts.data?.alerts ?? [],
    alertSummary: {
      count: alerts.data?.count ?? 0,
      high_priority: alerts.data?.high_priority ?? 0,
    },
    financeData: finance.data?.chart ?? [],
    financeSummary: finance.data?.summary ?? { revenue: 0, expenses: 0, profit: 0 },
    assetStats: {
      overall_utilization: assets.data?.overall_utilization ?? 0,
      available: assets.data?.available ?? 0,
      in_use: assets.data?.in_use ?? 0,
      repair: assets.data?.repair ?? 0,
      damaged: assets.data?.damaged ?? 0,
    },
    assetBar: assets.data?.chart ?? [],
    todayScans: qr.data?.today_scans ?? 0,
    qrActivity: qr.data?.activities ?? [],
    invoiceSummary: invoices.data?.summary ?? { total_billed: 0, collected: 0, pending: 0, overdue: 0 },
    invoices: invoices.data?.invoices ?? [],
    crew: crew.data?.crew ?? [],
    isLoading,
    isRefetching,
    refetchCount,
    isError,
    refetchAll,
  };
}
