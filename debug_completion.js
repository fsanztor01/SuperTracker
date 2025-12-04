// DEBUG SCRIPT FOR SUPERTRACKER COMPLETION BUG
// Copy and paste this into the browser console when SuperTracker is loaded

console.log('='.repeat(60));
console.log('SUPERTRACKER DEBUG: ANALYZING SESSION COMPLETION');
console.log('='.repeat(60));

if (typeof app === 'undefined') {
    console.error('ERROR: app object not found. Make sure you are logged in to SuperTracker.');
} else {
    console.log('\n1. TOTAL SESSIONS:', app.sessions.length);

    const completedSessions = app.sessions.filter(s => s.completed);
    const incompleteSessions = app.sessions.filter(s => !s.completed);

    console.log('2. COMPLETED SESSIONS:', completedSessions.length);
    console.log('3. INCOMPLETE SESSIONS:', incompleteSessions.length);

    if (completedSessions.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('COMPLETED SESSION EXAMPLE:');
        console.log('='.repeat(60));
        const completed = completedSessions[0];
        console.log('ID:', completed.id);
        console.log('Name:', completed.name);
        console.log('Date:', completed.date);
        console.log('Completed:', completed.completed);
        console.log('Completed type:', typeof completed.completed);
        console.log('Completed value (strict):', completed.completed === true);
        console.log('Full object:', JSON.stringify(completed, null, 2));
    }

    if (incompleteSessions.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('INCOMPLETE SESSION EXAMPLE:');
        console.log('='.repeat(60));
        const incomplete = incompleteSessions[0];
        console.log('ID:', incomplete.id);
        console.log('Name:', incomplete.name);
        console.log('Date:', incomplete.date);
        console.log('Completed:', incomplete.completed);
        console.log('Completed type:', typeof incomplete.completed);
        console.log('Completed value (strict):', incomplete.completed === true);
        console.log('Full object:', JSON.stringify(incomplete, null, 2));
    }

    console.log('\n' + '='.repeat(60));
    console.log('NOW: Try manually completing a session and run this script again');
    console.log('='.repeat(60));
}
