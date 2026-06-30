import { useEffect, useState } from 'react';
import { Target, Trophy, Plus, RefreshCw, Star, Flame } from 'lucide-react';
import { getMissions, getGamificationProfiles } from '../../features/gamification/gamification.api';
import type { Mission, GamificationProfile } from '../../features/gamification/gamification.types';
import { MissionFormModal } from './MissionFormModal';
import { trackInternalEvent } from '../../lib/analytics';

export const GamificationPage = () => {
  const [activeTab, setActiveTab] = useState<'MISSIONS' | 'LEADERBOARD'>('MISSIONS');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [profiles, setProfiles] = useState<GamificationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'MISSIONS') {
        const data = await getMissions();
        setMissions(data);
      } else {
        const data = await getGamificationProfiles();
        setProfiles(data);
      }
    } catch (error) {
      console.error('Failed to fetch gamification data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    trackInternalEvent({ eventName: 'gamification_tab_viewed', payload: { tab: activeTab } });
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gamification Engine</h1>
            <p className="text-slate-500 text-sm mt-1">Manage missions and view player leaderboards</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors font-medium border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {activeTab === 'MISSIONS' && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm shadow-indigo-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Mission
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'MISSIONS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('MISSIONS')}
        >
          <Target className="w-4 h-4" />
          Missions Builder
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'LEADERBOARD' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('LEADERBOARD')}
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : activeTab === 'MISSIONS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${mission.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {mission.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{mission.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{mission.description}</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type</span>
                    <span className="font-medium text-slate-800">{mission.missionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Value</span>
                    <span className="font-medium text-slate-800">{mission.targetValue}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-5 h-5 fill-current" />
                  +{mission.xpReward} XP
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                  {mission.code}
                </span>
              </div>
            </div>
          ))}
          {missions.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              No missions found. Click "Create Mission" to start building.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Level</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total XP</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Streak</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {profiles.map((profile, index) => (
                <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{profile.user.fullName}</div>
                    <div className="text-sm text-slate-500">{profile.user.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      Level {profile.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-bold">
                    {profile.totalXp.toLocaleString()} XP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <div className="flex items-center gap-1">
                      <Flame className={`w-4 h-4 ${profile.currentStreakDays > 0 ? 'text-orange-500' : 'text-slate-300'}`} />
                      {profile.currentStreakDays} days
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles.length === 0 && (
            <div className="text-center py-12 text-slate-500">No gamification profiles found.</div>
          )}
        </div>
      )}

      {isFormOpen && (
        <MissionFormModal
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};
