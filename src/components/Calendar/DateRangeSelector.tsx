import React from 'react';

interface DateRangeSelectorProps {
    currentDateRange: string;
    onRangeChange: (range: 'day' | 'week' | 'month') => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ currentDateRange, onRangeChange }) => {
    const [selectedRange, setSelectedRange] = React.useState('week');

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value as 'day' | 'week' | 'month';
        setSelectedRange(value);
        onRangeChange(value);
    };

    return (
        <div className="date-range-selector">
            <span className="current-range">{currentDateRange}</span>
            <select className="range-select" value={selectedRange} onChange={handleChange}>
                <option value="week">Week</option>
                <option value="day">Day</option>
                <option value="month">Month</option>
                {/* Add other options */}
            </select>
        </div>
    );
};

export default DateRangeSelector;
