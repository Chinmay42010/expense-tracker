function SpendingChart({ expenses }) {
  const categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const chartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="empty-state">
        <h3>No spending yet</h3>
        <p>Add an expense and your category breakdown will show up here.</p>
      </div>
    );
  }

  return (
    <div className="chart">
      {chartData.map((entry, i) => {
        const pct = Math.round((entry.value / total) * 100);
        return (
          <div key={entry.name} className="chart-row">
            <div className="chart-row-head">
              <span className="chart-cat">{entry.name}</span>
              <span className="chart-val">
                {"₹" + entry.value.toLocaleString("en-IN")} · {pct}%
              </span>
            </div>
            <div className="chart-track">
              <div
                className="chart-bar"
                style={{ width: `${pct}%`, animationDelay: `${i * 70}ms` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SpendingChart;
