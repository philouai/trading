/**
 * Trading Dashboard — Google Apps Script Backend
 * Deploy as a Web App to enable cross-device sync.
 * Setup instructions in SETUP.md
 */

// CONFIGURATION — change these
const SECRET_KEY = 'CHANGE-ME-TO-A-RANDOM-STRING';
const SHEET_NAME = 'Trades';

// DO NOT EDIT BELOW
const HEADERS = ['id', 'date', 'instrument', 'tier', 'direction', 'level', 'session', 'tap', 'riskType', 'r', 'result', 'system', 'emotion', 'notes', 'createdAt'];

function doGet(e) {
  try {
    const action = e.parameter.action;
    const key = e.parameter.key;
    if (key !== SECRET_KEY) return jsonResponse({ success: false, error: 'Invalid key' });
    if (action === 'ping') return jsonResponse({ success: true, message: 'pong' });
    if (action === 'list') return jsonResponse({ success: true, trades: listTrades() });
    return jsonResponse({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.key !== SECRET_KEY) return jsonResponse({ success: false, error: 'Invalid key' });
    if (data.action === 'add') { addTrade(data); return jsonResponse({ success: true }); }
    if (data.action === 'delete') { deleteTrade(data.id); return jsonResponse({ success: true }); }
    if (data.action === 'replace') { replaceAll(data.trades); return jsonResponse({ success: true }); }
    return jsonResponse({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function listTrades() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return data.map(row => {
    const trade = {};
    HEADERS.forEach((h, i) => {
      let val = row[i];
      if (h === 'tier' || h === 'r') val = typeof val === 'number' ? val : (val ? parseFloat(val) : 0);
      if (h === 'date' && val instanceof Date) val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      trade[h] = val;
    });
    return trade;
  }).reverse();
}

function addTrade(trade) {
  const sheet = getSheet();
  const row = HEADERS.map(h => {
    if (h === 'createdAt') return new Date().toISOString();
    return trade[h] !== undefined ? trade[h] : '';
  });
  sheet.appendRow(row);
}

function deleteTrade(id) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (ids[i][0] === id) { sheet.deleteRow(i + 2); return; }
  }
}

function replaceAll(trades) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
  if (trades && trades.length > 0) {
    const rows = trades.slice().reverse().map(t =>
      HEADERS.map(h => {
        if (h === 'createdAt') return t.createdAt || new Date().toISOString();
        return t[h] !== undefined ? t[h] : '';
      })
    );
    sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  }
}
