import React from 'react';

interface DateNavigationProps {
    onPrevious: () => void;
    onNext: () => void;
    onToday: () => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({ onPrevious, onNext, onToday }) => {
    return (
        <div className="date-navigation">
            <button className="nav-button" onClick={onPrevious}>{'<'}</button>
            <button className="nav-button" onClick={onToday}>Today</button>
            <button className="nav-button" onClick={onNext}>{'>'}</button>
        </div>
    );
};

export default DateNavigation;
