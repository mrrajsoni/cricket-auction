import type {Group} from '@/types';
import './GroupBadge.css';

interface GroupBadgeProps {
    group: Group;
    size?: 'sm' | 'md' | 'lg';
}

export function GroupBadge({group, size = 'md'}: GroupBadgeProps) {
    return (
        <span className={`group-badge group-badge--${group.toLowerCase()} group-badge--${size}`}>
            {group}
        </span>
    );
}
