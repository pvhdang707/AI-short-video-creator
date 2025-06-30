import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';

export const useScripts = () => {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      setLoading(true);
      const data = await projectService.getMyScripts();
      setScripts(data);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải danh sách scripts:', err);
      setError(err.message || 'Không thể tải danh sách scripts');
    } finally {
      setLoading(false);
    }
  };

  const deleteScript = async (scriptId) => {
    try {
      await projectService.deleteScript(scriptId);
      setScripts(prev => prev.filter(s => s.id !== scriptId));
      return true;
    } catch (err) {
      console.error('Lỗi khi xóa script:', err);
      throw err;
    }
  };

  const archiveScript = async (scriptId) => {
    try {
      await projectService.archiveScript(scriptId);
      setScripts(prev => prev.map(s => s.id === scriptId ? { ...s, status: 'ARCHIVED' } : s));
      return true;
    } catch (err) {
      console.error('Lỗi khi lưu trữ script:', err);
      throw err;
    }
  };

  const restoreScript = async (scriptId) => {
    try {
      await projectService.restoreScript(scriptId);
      setScripts(prev => prev.map(s => s.id === scriptId ? { ...s, status: 'ACTIVE' } : s));
      return true;
    } catch (err) {
      console.error('Lỗi khi khôi phục script:', err);
      throw err;
    }
  };

  const updateScript = async (scriptId, updateData) => {
    try {
      const updatedScript = await projectService.updateScript(scriptId, updateData);
      setScripts(prev => prev.map(s => s.id === scriptId ? updatedScript : s));
      return updatedScript;
    } catch (err) {
      console.error('Lỗi khi cập nhật script:', err);
      throw err;
    }
  };

  return { 
    scripts, 
    loading, 
    error, 
    deleteScript, 
    archiveScript, 
    restoreScript, 
    updateScript,
    refreshScripts: loadScripts
  };
}; 