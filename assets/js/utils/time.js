export function timeAgo(dateString) {
    const noteDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now - noteDate; 
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    console.log(dateString, "->", diffInDays, "days ago");
    if (diffInSecs < 60) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return noteDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}   
