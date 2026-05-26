/* Storage layer — local + Google Sheets sync */

const Storage = {
  STORAGE_KEY: 'trading_dashboard_trades',
  SETTINGS_KEY: 'trading_dashboard_settings',

  getLocal() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to read local storage:', e);
      return [];
    }
  },

  setLocal(trades) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trades));
      return true;
    } catch (e) {
      return false;
    }
  },

  getSettings() {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      return raw ? JSON.parse(raw) : { url: '', key: '' };
    } catch (e) {
      return { url: '', key: '' };
    }
  },

  setSettings(settings) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      return false;
    }
  },

  isCloudConfigured() {
    const s = this.getSettings();
    return s.url && s.key;
  },

  async addTrade(trade) {
    const trades = this.getLocal();
    trades.unshift(trade);
    this.setLocal(trades);

    if (this.isCloudConfigured()) {
      try {
        await this.cloudSync('add', trade);
        return { local: true, cloud: true };
      } catch (e) {
        console.error('Cloud sync failed:', e);
        return { local: true, cloud: false, error: e.message };
      }
    }
    return { local: true, cloud: false };
  },

  async deleteTrade(id) {
    const trades = this.getLocal();
    const filtered = trades.filter(t => t.id !== id);
    this.setLocal(filtered);

    if (this.isCloudConfigured()) {
      try {
        await this.cloudSync('delete', { id });
        return { local: true, cloud: true };
      } catch (e) {
        return { local: true, cloud: false };
      }
    }
    return { local: true, cloud: false };
  },

  async pullFromCloud() {
    if (!this.isCloudConfigured()) return null;
    const settings = this.getSettings();
    try {
      const url = `${settings.url}?action=list&key=${encodeURIComponent(settings.key)}`;
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      if (data.success) {
        this.setLocal(data.trades);
        return data.trades;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (e) {
      console.error('Failed to pull from cloud:', e);
      throw e;
    }
  },

  async pushToCloud() {
    if (!this.isCloudConfigured()) return null;
    const trades = this.getLocal();
    return await this.cloudSync('replace', { trades });
  },

  async testCloud(url, key) {
    try {
      const testUrl = `${url}?action=ping&key=${encodeURIComponent(key)}`;
      const response = await fetch(testUrl, { method: 'GET' });
      const data = await response.json();
      return data.success === true;
    } catch (e) {
      console.error('Test failed:', e);
      return false;
    }
  },

  async cloudSync(action, payload) {
    const settings = this.getSettings();
    if (!settings.url || !settings.key) {
      throw new Error('Cloud not configured');
    }
    const body = {
      action,
      key: settings.key,
      ...payload
    };
    const response = await fetch(settings.url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Sync failed');
    }
    return data;
  }
};
