export const formatCurrency = (amount: number): string => {
  return (
    "Rp" +
    new Intl.NumberFormat("id-ID", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount)
  );
};
