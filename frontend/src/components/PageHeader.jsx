import PropTypes from 'prop-types';

/**
 * Modern page header component with gradient background
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  actions,
  gradient = 'bg-gradient-ocean'
}) => {
  return (
    <div className={`${gradient} rounded-2xl p-6 md:p-8 mb-6 shadow-xl`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Icon className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 drop-shadow-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/90 text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex gap-3 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  actions: PropTypes.node,
  gradient: PropTypes.string,
};

export default PageHeader;
