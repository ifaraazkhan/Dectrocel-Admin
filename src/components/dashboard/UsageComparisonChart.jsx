import React from 'react';

const UsageComparisonChart = ({ data, onCategoryClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No usage data available
      </div>
    );
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + parseInt(item.count), 0);

  // Color mapping for each category
  const colorMap = {
    'High Usage': { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' },
    'Medium Usage': { bg: 'bg-sky-400', text: 'text-sky-600', light: 'bg-sky-100' },
    'Low Usage': { bg: 'bg-blue-400', text: 'text-blue-600', light: 'bg-blue-100' },
    'Unused': { bg: 'bg-blue-600', text: 'text-blue-700', light: 'bg-blue-100' },
    'No Credits': { bg: 'bg-slate-500', text: 'text-slate-700', light: 'bg-slate-100' }
  };

  // Find max count for scaling bars
  const maxCount = Math.max(...data.map(item => parseInt(item.count)));

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">High Usage (&gt;80% used)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-sky-400 rounded"></div>
          <span className="text-gray-600">Medium Usage (50-80% used)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span className="text-gray-600">Low Usage (&lt;50% used)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-gray-600">Unused (0% used)</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const count = parseInt(item.count);
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const colors = colorMap[item.usage_category] || colorMap['No Credits'];

          return (
            <div
              key={index}
              className="space-y-1 cursor-pointer"
              onClick={() => onCategoryClick && onCategoryClick(item.usage_category)}
              title={`Click to view ${count} licenses`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${colors.text}`}>
                  {item.usage_category}
                </span>
                <span className="text-gray-600">
                  {count} licenses ({percentage}%)
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-6 hover:bg-gray-300 transition-colors">
                <div
                  className={`${colors.bg} h-6 rounded-full transition-all duration-500 flex items-center justify-end px-2 hover:opacity-90`}
                  style={{ width: `${barWidth}%` }}
                >
                  {barWidth > 15 && (
                    <span className="text-white text-xs font-medium">
                      {count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-600">Total Active Licenses</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {data.find(item => item.usage_category === 'High Usage')?.count || 0}
          </p>
          <p className="text-xs text-gray-600">High Usage Licenses</p>
        </div>
      </div>
    </div>
  );
};

export default UsageComparisonChart;
