import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Typography } from '@/components/Typography';
import { FloatingTabBar } from '@/components/FloatingTabBar';

const PROMPTS = ['Swap today’s dinner', 'My knees hurt during lunges', 'How should I recover?', 'Explain my calorie goal'];

export default function CoachScreen() {
  const [messages, setMessages] = useState([{ from: 'coach', text: 'I’m your prototype Stryft Coach. Ask about training, Nigerian meals, recovery, or your roadmap.' }]);
  const [input, setInput] = useState('');
  const send = (text = input) => {
    if (!text.trim()) return;
    setMessages((current) => [...current, { from: 'user', text }, { from: 'coach', text: replyFor(text) }]);
    setInput('');
  };
  return <SafeAreaView style={styles.safeArea}><View style={styles.content}><View style={styles.header}><View><Typography variant="caption" color={Colors.dark.primary} weight="700">CONTEXT-AWARE</Typography><Typography variant="h1">AI Coach</Typography></View><View style={styles.online}><View style={styles.onlineDot} /><Typography variant="caption" weight="700">Prototype</Typography></View></View><ScrollView style={styles.messages} contentContainerStyle={styles.messageContent}>{messages.map((message, index) => <View key={index} style={[styles.bubble, message.from === 'user' ? styles.userBubble : styles.coachBubble]}>{message.from === 'coach' && <Ionicons name="sparkles" size={18} color={Colors.dark.primary} />}<Typography variant="body" style={message.from === 'coach' ? styles.coachText : undefined}>{message.text}</Typography></View>)}<View style={styles.prompts}>{PROMPTS.map((prompt) => <TouchableOpacity key={prompt} style={styles.prompt} onPress={() => send(prompt)}><Typography variant="caption">{prompt}</Typography></TouchableOpacity>)}</View></ScrollView><View style={styles.inputRow}><TextInput value={input} onChangeText={setInput} placeholder="Ask your coach..." placeholderTextColor={Colors.dark.textSecondary} style={styles.input} /><TouchableOpacity style={styles.send} onPress={() => send()}><Ionicons name="arrow-up" size={21} color={Colors.dark.text} /></TouchableOpacity></View></View><FloatingTabBar /></SafeAreaView>;
}

function replyFor(text: string) {
  const value = text.toLowerCase();
  if (value.includes('dinner') || value.includes('meal')) return 'Try Eba with okra soup and grilled fish. It stays close to today’s calorie target while using familiar local ingredients.';
  if (value.includes('knee') || value.includes('lunge')) return 'Swap reverse lunges for supported split squats, reduce range of motion, and stop if pain persists. This is not medical advice.';
  if (value.includes('recover')) return 'Prioritize hydration, your planned recovery walk, and consistent sleep tonight. Your current streak suggests keeping intensity moderate.';
  return 'Your calorie target balances your goal, training frequency, and recovery inputs. Weekly check-ins help the roadmap adjust.';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  content: { flex: 1, padding: 24, paddingBottom: 98 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  online: { flexDirection: 'row', gap: 6, alignItems: 'center', padding: 9, borderRadius: 14, backgroundColor: Colors.dark.backgroundElement },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#42D392' },
  messages: { flex: 1 },
  messageContent: { paddingVertical: 20, gap: 12 },
  bubble: { maxWidth: '88%', padding: 15, borderRadius: 18 },
  coachBubble: { alignSelf: 'flex-start', flexDirection: 'row', backgroundColor: Colors.dark.backgroundElement },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.dark.primary },
  coachText: { flex: 1, marginLeft: 8 },
  prompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  prompt: { padding: 11, borderRadius: 16, borderWidth: 1, borderColor: Colors.dark.border, backgroundColor: Colors.dark.backgroundElement },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, height: 52, paddingHorizontal: 16, borderRadius: 18, color: Colors.dark.text, backgroundColor: Colors.dark.backgroundElement },
  send: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.primary },
});
