// Run this in the browser console or import once in App.tsx for a hard reset
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');
window.location.reload();
