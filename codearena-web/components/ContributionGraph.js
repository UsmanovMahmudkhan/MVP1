import React, { useMemo } from 'react';
import styles from '@/styles/ContributionGraph.module.css';

export default function ContributionGraph({ data }) {
    // Process data to map date -> count
    const activityMap = useMemo(() => {
        const map = {};
        if (data && Array.isArray(data)) {
            data.forEach(item => {
                map[item.date] = item.count;
            });
        }
        return map;
    }, [data]);

    // Generate calendar grid
    const calendar = useMemo(() => {
        const weeks = [];
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        // Align start date to the previous Sunday
        const startDate = new Date(oneYearAgo);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        let currentDate = new Date(startDate);
        const endDate = new Date();

        while (currentDate <= endDate) {
            const week = [];
            for (let i = 0; i < 7; i++) {
                const dateStr = currentDate.toISOString().split('T')[0];
                week.push({
                    date: dateStr,
                    count: activityMap[dateStr] || 0,
                    dateObj: new Date(currentDate)
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            weeks.push(week);
        }
        return weeks;
    }, [activityMap]);

    // Determine color level (0-4)
    const getLevel = (count) => {
        if (count === 0) return 0;
        if (count <= 1) return 1;
        if (count <= 3) return 2;
        if (count <= 6) return 3;
        return 4;
    };

    return (
        <div className={styles.graphContainer}>
            <div className={styles.header}>
                <span className={styles.title}>Contribution Activity</span>
            </div>

            <div className={styles.graph}>
                {calendar.map((week, wIndex) => (
                    <div key={wIndex} className={styles.week}>
                        {week.map((day, dIndex) => (
                            <div
                                key={dIndex}
                                className={`${styles.day} ${styles[`level${getLevel(day.count)}`]}`}
                            >
                                <div className={styles.tooltip}>
                                    {day.count} contributions on {day.date}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className={styles.legend}>
                <span>Less</span>
                <div className={`${styles.legendItem} ${styles.level0}`}></div>
                <div className={`${styles.legendItem} ${styles.level1}`}></div>
                <div className={`${styles.legendItem} ${styles.level2}`}></div>
                <div className={`${styles.legendItem} ${styles.level3}`}></div>
                <div className={`${styles.legendItem} ${styles.level4}`}></div>
                <span>More</span>
            </div>
        </div>
    );
}
