
import api from './api';

export const getMatches = () => api.get('/matches');
export const getMatch = (id: string) => api.get(`/matches/${id}`);
export const createMatch = (data: any) => api.post('/matches', data);
export const updateMatch = (id: string, data: any) => api.patch(`/matches/${id}`, data);
export const updateMatchPlayers = (id: string, data: any) => api.patch(`/matches/${id}/players`, data);
export const deleteMatch = (id: string) => api.delete(`/matches/${id}`);
export const getNextMatch = () => api.get('/matches/next');
