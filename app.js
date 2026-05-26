/* Trading Dashboard — Main App Logic */

// Tab navigation
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + target).classList.add('active');
    if (target === 'stats') Stats.refresh();
    if (target === 'history') History.refresh();
  });
});

// ===== GREEN LIGHT CHECKER =====
const GL = {
  selectedTier: null,
  checkState: {},

  checklists: {
    structure: [
      { id: 's1', label: 'Standard level inside the zone', help: 'Round, 200, 500, or 800 within 5-8 pip tolerance' },
      { id: 's2', label: 'Zone correctly drawn', help: 'Close-to-wick, max 20 pips wide' },
      { id: 's3', label: 'No 4H/1H body has closed beyond the zone', help: 'Wicks beyond are fine. Bodies invalidate.' }
    ],
    timing: [
      { id: 't1', label: 'In active window', help: 'London 12-15 or NY 18-21 (Dubai time)' },
      { id: 't2', label: 'Not in tight consolidation', help: 'Price approaching the level, not stuck in a range' },
      { id: 't3', label: 'No major news in next 2 hours', help: 'Check economic calendar' },
      { id: 't4', label: 'Not Friday afternoon', help: 'Avoid weekend gap risk' }
    ],
    confirm: [
      { id: 'c1', label: 'Tier-specific confirmation present', help: 'Select tier to see details' },
      { id: 'c2', label: 'Cloud is not chopping inside', help: 'Either trending or break confirmed' },
      { id: 'c3', label: 'Tap count appropriate for tier', help: 'Select tier to see details' }
    ],
    risk: [
      { id: 'r1', label: 'SL placement defined', help: 'Beyond zone edge + 5-8 pip buffer' },
      { id: 'r2', label: 'TP at next standard level gives 3R+', help: 'If less than 3R available, no trade' },
      { id: 'r3', label: 'Lot size calculated for 1% risk', help: 'Or reinvested 3R if compounding' },
      { id: 'r4', label: 'I am calm — not rushed or revenge trading', help: 'If emotional, walk away' }
    ]
  },

  init() {
    this.buildSection('check-structure', this.checklists.structure);
    this.buildSection('check-timing', this.checklists.timing);
    this.buildSection('check-confirm', this.checklists.confirm);
    this.buildSection('check-risk', this.checklists.risk);
    this.updateStatus();
  },

  buildSection(id, items) {
    const html = items.map(item => `
      <label class="check-item" data-id="${item.id}">
        <input type="checkbox" data-id="${item.id}" onchange="GL.toggle('${item.id}', this.checked)">
        <div class="check-text">
          <div class="check-label" data-label="${item.id}">${item.label}</div>
          <div class="check-help" data-help="${item.id}">${item.help}</div>
        </div>
      </label>
    `).join('');
    document.getElementById(id).innerHTML = html;
  },

  setTier(tier) {
    this.selectedTier = tier;
    document.querySelectorAll('[data-tier]').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.tier) === tier);
    });

    const c1Label = document.querySelector('[data-label="c1"]');
    const c1Help = document.querySelector('[data-help="c1"]');
    const c3Label = document.querySelector('[data-label="c3"]');
    const c3Help = document.querySelector('[data-help="c3"]');

    if (tier === 3) {
      c1Label.textContent = '1H body close beyond level + 5M retest rejection';
      c1Help.textContent = 'Wick break is not enough. Wait for 1H candle body close.';
      c3Label.textContent = '1st retest after the break confirmed';
      c3Help.textContent = 'Price pushed 15-20 pips beyond, pulled back, 5M rejected';
    } else if (tier === 1) {
      c1Label.textContent = '5M shows 1-2 rejection wicks at exact level';
      c1Help.textContent = 'Each wick must close back inside the zone';
      c3Label.textContent = 'Minimum 3rd tap at historical level';
      c3Help.textContent = 'Level respected across multiple sessions or weekly history';
    } else {
      c1Label.textContent = '5M shows 1-2 rejection wicks at exact level';
      c1Help.textContent = 'Each wick must close back inside the zone';
      c3Label.textContent = '2nd tap of the zone (or 3rd)';
      c3Help.textContent = 'Asia or pre-session formed the 1st tap';
    }

    this.updateStatus();
  },

  toggle(id, checked) {
    this.checkState[id] = checked;
    document.querySelector(`.check-item[data-id="${id}"]`).classList.toggle('checked', checked);
    this.updateStatus();
  },

  getAllIds() {
    return [
      ...this.checklists.structure.map(i => i.id),
      ...this.checklists.timing.map(i => i.id),
      ...this.checklists.confirm.map(i => i.id),
      ...this.checklists.risk.map(i => i.id)
    ];
  },

  updateStatus() {
    const all = this.getAllIds();
    const checked = all.filter(id => this.checkState[id]).length;
    const total = all.length;

    const statusEl = document.getElementById('gl-status');
    const statusText = document.getElementById('gl-status-text');
    const summaryEl = document.getElementById('gl-summary');
    const goBtn = document.getElementById('gl-go-btn');

    statusEl.classList.remove('status-red', 'status-amber', 'status-green');
    summaryEl.classList.remove('green');

    if (!this.selectedTier) {
      statusEl.classList.add('status-red');
      statusText.textContent = 'RED — select tier first';
      summaryEl.innerHTML = 'Select a tier and complete all checks to unlock the entry.';
      goBtn.disabled = true;
    } else if (checked === total) {
      statusEl.classList.add('status-green');
      statusText.textContent = 'GREEN — cleared for entry';
      summaryEl.innerHTML = `<strong>All ${total} checks passed for Tier ${this.selectedTier}.</strong> You may enter the trade. Switch to "Log trade" tab when the order is placed.`;
      summaryEl.classList.add('green');
      goBtn.disabled = false;
    } else if (checked >= total - 2) {
      statusEl.classList.add('status-amber');
      statusText.textContent = `AMBER — ${total - checked} remaining`;
      summaryEl.innerHTML = `<strong>${checked} of ${total} checks passed.</strong> Complete the remaining items before entering.`;
      goBtn.disabled = true;
    } else {
      statusEl.classList.add('status-red');
      statusText.textContent = `RED — ${checked} of ${total}`;
      summaryEl.innerHTML = `<strong>${checked} of ${total} checks passed.</strong> Setup is not complete. Do not trade.`;
      goBtn.disabled = true;
    }
  },

  reset() {
    this.checkState = {};
    this.selectedTier = null;
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.check-item').forEach(item => item.classList.remove('checked'));
    document.querySelectorAll('[data-tier]').forEach(b => b.classList.remove('active'));
    this.updateStatus();
  },

  proceed() {
    if (this.selectedTier) Log.setTier(this.selectedTier);
    document.querySelector('[data-tab="log"]').click();
  }
};

// ===== LOG TRADE =====
const Log = {
  selectedTier: null,
  selectedResult: null,

  init() {
    document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
  },

  setTier(tier) {
    this.selectedTier = tier;
    document.querySelectorAll('[data-log-tier]').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.logTier) === tier);
    });
    this.updateSubmit();
  },

  setResult(result) {
    this.selectedResult = result;
    document.querySelectorAll('[data-result]').forEach(b => {
      b.classList.toggle('active', b.dataset.result === result);
    });
    this.updateSubmit();
  },

  updateSubmit() {
    document.getElementById('submit-btn').disabled = !(this.selectedTier && this.selectedResult);
  },

  async save() {
    const trade = {
      id: 'trade_' + Date.now(),
      date: document.getElementById('f-date').value,
      instrument: document.getElementById('f-instrument').value,
      tier: this.selectedTier,
      direction: document.getElementById('f-direction').value,
      level: document.getElementById('f-level').value,
      session: document.getElementById('f-session').value,
      tap: document.getElementById('f-tap').value,
      riskType: document.getElementById('f-risk').value,
      r: parseFloat(document.getElementById('f-r').value) || 0,
      result: this.selectedResult,
      system: document.getElementById('f-system').value,
      emotion: document.getElementById('f-emotion').value,
      notes: document.getElementById('f-notes').value
    };

    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const result = await Storage.addTrade(trade);

    document.getElementById('f-level').value = '';
    document.getElementById('f-r').value = '';
    document.getElementById('f-notes').value = '';
    this.selectedTier = null;
    this.selectedResult = null;
    document.querySelectorAll('[data-log-tier]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[data-result]').forEach(b => b.classList.remove('active'));

    if (result.cloud) {
      btn.textContent = '✓ Saved & synced';
    } else if (result.local) {
      btn.textContent = '✓ Saved locally';
    }

    setTimeout(() => { btn.textContent = 'Save trade to journal'; }, 1800);
    updateSyncStatus();
  }
};

// ===== STATS =====
const Stats = {
  refresh() {
    const trades = Storage.getLocal();
    const total = trades.length;

    document.getElementById('stat-total').textContent = total;

    if (total === 0) {
      document.getElementById('stat-winrate').textContent = '—';
      document.getElementById('stat-avgr').textContent = '—';
      document.getElementById('stat-netr').textContent = '—';
      document.getElementById('tier-breakdown').innerHTML = '<div class="empty-state">No trades logged yet</div>';
      document.getElementById('adherence-stats').innerHTML = '';
      document.getElementById('insights').innerHTML = '<div class="insight">Log your first trade to see insights here.</div>';
      return;
    }

    const wins = trades.filter(t => t.result === 'win').length;
    const winRate = Math.round((wins / total) * 100);
    const netR = trades.reduce((sum, t) => sum + t.r, 0);
    const avgR = netR / total;

    document.getElementById('stat-winrate').textContent = winRate + '%';
    document.getElementById('stat-winrate').className = 'stat-val ' + (winRate >= 60 ? 'green' : winRate < 50 ? 'red' : '');
    document.getElementById('stat-avgr').textContent = avgR.toFixed(1) + 'R';
    document.getElementById('stat-avgr').className = 'stat-val ' + (avgR > 0 ? 'green' : 'red');
    document.getElementById('stat-netr').textContent = (netR >= 0 ? '+' : '') + netR.toFixed(1) + 'R';
    document.getElementById('stat-netr').className = 'stat-val ' + (netR >= 0 ? 'green' : 'red');

    this.renderTiers(trades);
    this.renderAdherence(trades);
    this.renderInsights(trades);
  },

  renderTiers(trades) {
    let html = '<div class="tier-stat-grid">';
    for (let t = 1; t <= 3; t++) {
      const tt = trades.filter(tr => tr.tier === t);
      const wins = tt.filter(tr => tr.result === 'win').length;
      const wr = tt.length > 0 ? Math.round((wins / tt.length) * 100) : 0;
      const r = tt.reduce((s, tr) => s + tr.r, 0);
      const avg = tt.length > 0 ? r / tt.length : 0;
      html += `
        <div class="tier-stat t${t}">
          <div class="tier-stat-name">Tier ${t}</div>
          <div class="tier-stat-row"><span>Trades</span><span class="tier-stat-val">${tt.length}</span></div>
          <div class="tier-stat-row"><span>Win rate</span><span class="tier-stat-val">${tt.length > 0 ? wr + '%' : '—'}</span></div>
          <div class="tier-stat-row"><span>Avg R</span><span class="tier-stat-val">${tt.length > 0 ? avg.toFixed(1) : '—'}</span></div>
          <div class="tier-stat-row total"><span>Net R</span><span class="tier-stat-val">${r >= 0 ? '+' : ''}${r.toFixed(1)}</span></div>
        </div>`;
    }
    html += '</div>';
    document.getElementById('tier-breakdown').innerHTML = html;
  },

  renderAdherence(trades) {
    const followed = trades.filter(t => t.system === 'yes');
    const broken = trades.filter(t => t.system !== 'yes');
    const followedWins = followed.filter(t => t.result === 'win').length;
    const brokenWins = broken.filter(t => t.result === 'win').length;
    const followedWR = followed.length > 0 ? Math.round((followedWins / followed.length) * 100) : 0;
    const brokenWR = broken.length > 0 ? Math.round((brokenWins / broken.length) * 100) : 0;
    const followedR = followed.reduce((s, t) => s + t.r, 0);
    const brokenR = broken.reduce((s, t) => s + t.r, 0);

    document.getElementById('adherence-stats').innerHTML = `
      <table class="adherence-table">
        <thead><tr><th></th><th>Trades</th><th>Win rate</th><th>Net R</th></tr></thead>
        <tbody>
          <tr>
            <td>System followed</td>
            <td class="mono">${followed.length}</td>
            <td class="mono" style="color: ${followedWR >= 60 ? 'var(--jade)' : 'inherit'}">${followed.length > 0 ? followedWR + '%' : '—'}</td>
            <td class="mono">${followed.length > 0 ? (followedR >= 0 ? '+' : '') + followedR.toFixed(1) : '—'}</td>
          </tr>
          <tr>
            <td>Rules broken</td>
            <td class="mono">${broken.length}</td>
            <td class="mono" style="color: ${brokenWR < 50 ? 'var(--crimson)' : 'inherit'}">${broken.length > 0 ? brokenWR + '%' : '—'}</td>
            <td class="mono">${broken.length > 0 ? (brokenR >= 0 ? '+' : '') + brokenR.toFixed(1) : '—'}</td>
          </tr>
        </tbody>
      </table>`;
  },

  renderInsights(trades) {
    const insights = [];
    const total = trades.length;
    const wins = trades.filter(t => t.result === 'win').length;
    const winRate = Math.round((wins / total) * 100);

    if (total < 10) {
      insights.push({ type: '', text: `You have ${total} trade${total === 1 ? '' : 's'} logged. Aim for 20-30 trades before drawing conclusions about your edge.` });
    } else {
      if (winRate >= 60) {
        insights.push({ type: 'success', text: `Win rate at ${winRate}% is above your 60% threshold. The system is working — keep executing.` });
      } else if (winRate >= 50) {
        insights.push({ type: '', text: `Win rate at ${winRate}% is positive but below target. Review which tier or session is underperforming.` });
      } else {
        insights.push({ type: 'warning', text: `Win rate at ${winRate}% is below 50%. Consider stopping live trading and bar-replaying to recalibrate.` });
      }

      const followed = trades.filter(t => t.system === 'yes');
      const broken = trades.filter(t => t.system !== 'yes');
      const followedWR = followed.length > 0 ? (followed.filter(t => t.result === 'win').length / followed.length) * 100 : 0;
      const brokenWR = broken.length > 0 ? (broken.filter(t => t.result === 'win').length / broken.length) * 100 : 0;

      if (broken.length > 0 && followed.length > 0 && followedWR > brokenWR + 15) {
        insights.push({ type: 'warning', text: `Trades that followed the system won ${Math.round(followedWR)}% vs ${Math.round(brokenWR)}% when rules were broken. Stay strict.` });
      }

      const tiers = [1, 2, 3].map(t => {
        const tt = trades.filter(tr => tr.tier === t);
        const tw = tt.filter(tr => tr.result === 'win').length;
        return { tier: t, wr: tt.length > 0 ? tw / tt.length : 0, count: tt.length };
      }).filter(x => x.count >= 3).sort((a, b) => b.wr - a.wr);

      if (tiers.length > 0) {
        insights.push({ type: 'success', text: `Your best-performing setup: Tier ${tiers[0].tier} (${Math.round(tiers[0].wr * 100)}% win rate over ${tiers[0].count} trades).` });
      }
    }

    document.getElementById('insights').innerHTML = insights.map(i => `<div class="insight ${i.type}">→ ${i.text}</div>`).join('');
  }
};

// ===== HISTORY =====
const History = {
  refresh() {
    const trades = Storage.getLocal();
    const el = document.getElementById('history-list');

    if (trades.length === 0) {
      el.innerHTML = '<div class="empty-state">No trades logged yet</div>';
      return;
    }

    el.innerHTML = trades.map(t => {
      const rClass = t.r > 0 ? 'green' : t.r < 0 ? 'red' : 'neutral';
      const rText = (t.r > 0 ? '+' : '') + t.r.toFixed(1) + 'R';
      return `
        <div class="trade-row">
          <div class="trade-date">${t.date}</div>
          <div class="trade-instrument">${t.instrument}</div>
          <div class="trade-tier t${t.tier}">T${t.tier}</div>
          <div class="trade-details">${t.direction} @ ${t.level || '—'} · ${t.session}</div>
          <div class="trade-result">${t.result}</div>
          <div class="trade-r ${rClass}">${rText}</div>
          <button class="delete-btn" onclick="History.delete('${t.id}')" title="Delete">×</button>
        </div>`;
    }).join('');
  },

  async delete(id) {
    if (!confirm('Delete this trade?')) return;
    await Storage.deleteTrade(id);
    this.refresh();
    Stats.refresh();
  },

  exportCSV() {
    const trades = Storage.getLocal();
    if (trades.length === 0) {
      alert('No trades to export.');
      return;
    }
    const headers = ['Date', 'Instrument', 'Tier', 'Direction', 'Level', 'Session', 'Tap', 'Risk Type', 'R', 'Result', 'System Followed', 'Emotion', 'Notes'];
    const rows = trades.map(t => [
      t.date, t.instrument, 'T' + t.tier, t.direction, t.level, t.session, t.tap, t.riskType,
      t.r, t.result, t.system, t.emotion, (t.notes || '').replace(/"/g, '""')
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell || '')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// ===== SETTINGS =====
const Settings = {
  open() {
    const s = Storage.getSettings();
    document.getElementById('setting-url').value = s.url || '';
    document.getElementById('setting-key').value = s.key || '';
    document.getElementById('settings-modal').classList.add('open');
    document.getElementById('settings-status').className = 'settings-status';
  },

  close() {
    document.getElementById('settings-modal').classList.remove('open');
  },

  async test() {
    const url = document.getElementById('setting-url').value.trim();
    const key = document.getElementById('setting-key').value.trim();
    const status = document.getElementById('settings-status');

    if (!url || !key) {
      status.className = 'settings-status show error';
      status.textContent = 'Enter both URL and key first.';
      return;
    }

    status.className = 'settings-status show';
    status.textContent = 'Testing connection...';

    const ok = await Storage.testCloud(url, key);

    if (ok) {
      status.className = 'settings-status show success';
      status.textContent = '✓ Connection successful. Click Save to enable sync.';
    } else {
      status.className = 'settings-status show error';
      status.textContent = '✗ Connection failed. Check URL, key, and that the script is deployed.';
    }
  },

  async save() {
    const url = document.getElementById('setting-url').value.trim();
    const key = document.getElementById('setting-key').value.trim();
    const status = document.getElementById('settings-status');

    if (!url || !key) {
      Storage.setSettings({ url: '', key: '' });
      status.className = 'settings-status show';
      status.textContent = 'Cloud sync disabled. Using local storage only.';
      updateSyncStatus();
      return;
    }

    Storage.setSettings({ url, key });
    status.className = 'settings-status show';
    status.textContent = 'Saved. Pulling existing trades from cloud...';

    try {
      await Storage.pullFromCloud();
      status.className = 'settings-status show success';
      status.textContent = '✓ Saved and synced. Your trades are now available across devices.';
      updateSyncStatus();
      Stats.refresh();
      History.refresh();
      setTimeout(() => this.close(), 1500);
    } catch (e) {
      try {
        await Storage.pushToCloud();
        status.className = 'settings-status show success';
        status.textContent = '✓ Saved and synced. Local trades pushed to cloud.';
        updateSyncStatus();
        setTimeout(() => this.close(), 1500);
      } catch (e2) {
        status.className = 'settings-status show error';
        status.textContent = '✗ Saved but sync failed: ' + e2.message;
      }
    }
  }
};

function updateSyncStatus() {
  const el = document.getElementById('sync-status');
  const text = document.getElementById('sync-text');
  if (Storage.isCloudConfigured()) {
    el.classList.add('synced');
    el.classList.remove('syncing');
    text.textContent = 'Cloud synced';
  } else {
    el.classList.remove('synced', 'syncing');
    text.textContent = 'Local only';
  }
}

document.getElementById('settings-btn').addEventListener('click', () => Settings.open());

GL.init();
Log.init();
updateSyncStatus();

if (Storage.isCloudConfigured()) {
  document.getElementById('sync-status').classList.add('syncing');
  document.getElementById('sync-text').textContent = 'Syncing...';
  Storage.pullFromCloud()
    .then(() => { updateSyncStatus(); Stats.refresh(); History.refresh(); })
    .catch(() => { updateSyncStatus(); });
}
