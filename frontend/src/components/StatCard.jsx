import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Modern stat card with gradient and animations
 */
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  trendValue,
  color = 'primary',
  loading = false,
  onClick
}) => {
  const colorClasses = {
    primary: {
      border: 'border-primary-500',
      iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600',
      trendUp: 'text-emerald-600',
      trendDown: 'text-red-600',
    },
    success: {
      border: 'border-emerald-500',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      trendUp: 'text-emerald-600',
      trendDown: 'text-red-600',
    },
    warning: {
      border: 'border-amber-500',
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      trendUp: 'text-emerald-600',
      trendDown: 'text-red-600',
    },
    danger: {
      border: 'border-red-500',
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      trendUp: 'text-emerald-600',
      trendDown: 'text-red-600',
    },
    purple: {
      border: 'border-purple-500',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      trendUp: 'text-emerald-600',
      trendDown: 'text-red-600',
    },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  if (loading) {
    return (
      <div className="stat-card border-l-4 border-gray-300 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`stat-card ${colors.border} hover-lift group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                trend === 'up' ? colors.trendUp : colors.trendDown
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>
        
        {Icon && (
          <div className={`${colors.iconBg} p-4 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.elementType,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'purple']),
  loading: PropTypes.bool,
  onClick: PropTypes.func,
};

export default StatCard;
