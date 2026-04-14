import React, { useState } from 'react';
import {
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MessageBlocker({
  driveModeActive,
  blockedMessages,
  blockedCount,
  autoReplyEnabled,
  setAutoReplyEnabled,
  replyMessage,
  setReplyMessage,
  clearMessages,
  smsAvailable,
}) {
  const [editingReply, setEditingReply] = useState(false);
  const [tempReply, setTempReply] = useState(replyMessage);

  const saveReply = () => {
    setReplyMessage(tempReply);
    setEditingReply(false);
  };

  return (
    <View>
      {/* STATUS CARD */}
      <View style={[styles.card, driveModeActive && styles.cardActive]}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>📵 Message Blocking</Text>
          <View style={[styles.badge, driveModeActive ? styles.badgeOn : styles.badgeOff]}>
            <Text style={[styles.badgeText, driveModeActive ? styles.badgeTextOn : styles.badgeTextOff]}>
              {driveModeActive ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{blockedCount}</Text>
            <Text style={styles.statLabel}>Blocked</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{driveModeActive ? '🔴' : '⚪️'}</Text>
            <Text style={styles.statLabel}>{driveModeActive ? 'Muting' : 'Normal'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{autoReplyEnabled ? '✅' : '❌'}</Text>
            <Text style={styles.statLabel}>Auto Reply</Text>
          </View>
        </View>
        <Text style={styles.hint}>
          {driveModeActive
            ? '🛡️ Notifications silenced. Drive safe!'
            : 'Activates automatically when Drive Mode turns ON'}
        </Text>
      </View>

      {/* AUTO REPLY TOGGLE */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>💬 Auto Reply</Text>
            <Text style={styles.toggleSub}>
              {smsAvailable ? 'Opens SMS with reply pre-filled' : 'SMS not available'}
            </Text>
          </View>
          <Switch
            value={autoReplyEnabled}
            onValueChange={setAutoReplyEnabled}
            trackColor={{ false: '#21262d', true: '#0d2b1e' }}
            thumbColor={autoReplyEnabled ? '#00ff87' : '#484f58'}
          />
        </View>
      </View>

      {/* REPLY MESSAGE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✏️ Auto Reply Message</Text>
        {editingReply ? (
          <>
            <TextInput
              style={styles.input}
              value={tempReply}
              onChangeText={setTempReply}
              multiline
              numberOfLines={3}
              maxLength={160}
              placeholderTextColor="#484f58"
            />
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingReply(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveReply}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.preview}>
              <Text style={styles.previewText}>"{replyMessage}"</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => { setTempReply(replyMessage); setEditingReply(true); }}
            >
              <Text style={styles.editBtnText}>✏️ Edit Message</Text>
            </TouchableOpacity>
          </>
        )}
        <Text style={styles.hint}>{replyMessage.length}/160 characters</Text>
      </View>

      {/* BLOCKED MESSAGES */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>📬 Blocked Messages ({blockedMessages.length})</Text>
          {blockedMessages.length > 0 && (
            <TouchableOpacity onPress={clearMessages}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        {blockedMessages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              {driveModeActive
                ? 'No messages blocked yet'
                : 'Messages blocked during Drive Mode appear here'}
            </Text>
          </View>
        ) : (
          blockedMessages.slice(0, 5).map((msg) => (
            <View key={msg.id} style={styles.msgRow}>
              <Text style={styles.msgSender}>{msg.sender}</Text>
              <Text style={styles.msgTime}>{msg.time}</Text>
              <Text style={styles.msgBody} numberOfLines={1}>{msg.message}</Text>
            </View>
          ))
        )}
        <Text style={styles.hint}>
          💡 Enable DriveZen notifications in phone Settings for full blocking
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#161b22', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#21262d' },
  cardActive: { borderColor: '#00ff87' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardTitle: { fontSize: 12, color: '#8892b0', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeOn: { backgroundColor: '#0d2b1e', borderColor: '#00ff87' },
  badgeOff: { backgroundColor: '#161b22', borderColor: '#30363d' },
  badgeText: { fontSize: 10, fontWeight: '700' },
  badgeTextOn: { color: '#00ff87' },
  badgeTextOff: { color: '#484f58' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#8892b0' },
  statDivider: { width: 1, height: 40, backgroundColor: '#21262d' },
  hint: { fontSize: 12, color: '#484f58', marginTop: 8, lineHeight: 18 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 14, color: '#c9d1d9', fontWeight: '600', marginBottom: 4 },
  toggleSub: { fontSize: 12, color: '#484f58' },
  preview: { backgroundColor: '#0d1117', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#21262d' },
  previewText: { fontSize: 14, color: '#00ff87', lineHeight: 20, fontStyle: 'italic' },
  editBtn: { backgroundColor: '#21262d', borderRadius: 8, padding: 10, alignItems: 'center' },
  editBtnText: { fontSize: 13, color: '#8892b0' },
  input: { backgroundColor: '#0d1117', borderRadius: 10, padding: 14, color: '#ffffff', fontSize: 14, marginBottom: 12, borderWidth: 1, borderColor: '#30363d', minHeight: 80, textAlignVertical: 'top' },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#21262d', borderRadius: 8, padding: 10, alignItems: 'center' },
  cancelText: { fontSize: 13, color: '#8892b0' },
  saveBtn: { flex: 1, backgroundColor: '#0d2b1e', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#00ff87' },
  saveText: { fontSize: 13, color: '#00ff87', fontWeight: '600' },
  clearText: { fontSize: 12, color: '#ff6b6b' },
  empty: { alignItems: 'center', paddingVertical: 20 },
  emptyIcon: { fontSize: 32, marginBottom: 10 },
  emptyText: { fontSize: 13, color: '#484f58', textAlign: 'center', lineHeight: 20 },
  msgRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#21262d' },
  msgSender: { fontSize: 13, color: '#c9d1d9', fontWeight: '600' },
  msgTime: { fontSize: 11, color: '#484f58' },
  msgBody: { fontSize: 12, color: '#8892b0', marginTop: 2 },
});