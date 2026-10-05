import { useLibrary } from '@/state/library';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Icon, Message, u } from '@/components/library/ui';
import AuthTemplate from '@/components/library/AuthTemplate';
import { palette as c } from '@/constants/design-system';
export default function Signup() {
  const { register } = useLibrary(); const [busy, setBusy] = useState(false);
  const [name, setName] = useState(''), [student, setStudent] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [department, setDepartment] = useState(''), [accepted, setAccepted] = useState(false), [error, setError] = useState('');
  async function submit() { if (busy) return; if (!name.trim() || !student.trim() || !department.trim() || !email.includes('@') || password.length < 8 || !accepted) { setError('Complete all fields, use a password of at least 8 characters, and accept the borrowing terms.'); return; } setBusy(true); setError(''); try { await register({ name, studentId: student, department, email, password, acceptedTerms: accepted }); setPassword(''); router.replace('/home'); } catch (e) { setError(e instanceof Error ? e.message : 'Registration failed.'); } finally { setBusy(false); } }
  return (
    <AuthTemplate
      accessLabel="STUDENT & STAFF ACCESS"
      accessBadge="New member"
      footer={(
        <View style={[u.row, { justifyContent: 'center', flexWrap: 'wrap' }]}>
          <Text style={u.small}>Already have an account?</Text>
          <Pressable onPress={() => router.replace('/login')}><Text style={[u.link, { color: c.primary }]}>Sign in</Text></Pressable>
        </View>
      )}
    >
      <Card style={{ padding: 32, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={u.title}>Create your account.</Text>
          <Text style={u.body}>Use your university details to join the library.</Text>
        </View>
        <Field label="FULL NAME" placeholder="Alex Morgan" value={name} onChangeText={setName} autoComplete="name" style={{ backgroundColor: c.primarySoft }} />
        <Field label="STUDENT / STAFF ID" placeholder="IT20240001" value={student} onChangeText={setStudent} style={{ backgroundColor: c.primarySoft }} />
        <Field label="UNIVERSITY EMAIL" placeholder="you@university.edu" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ backgroundColor: c.primarySoft }} />
        <Field label="DEPARTMENT / FACULTY" placeholder="School of Computing" value={department} onChangeText={setDepartment} style={{ backgroundColor: c.primarySoft }} />
        <Field label="PASSWORD" placeholder="At least 8 characters" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" style={{ backgroundColor: c.primarySoft }} />
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={u.row}>
          <Icon name={accepted ? 'check-square' : 'square'} color={accepted ? c.primary : c.secondary} />
          <Text style={[u.small, { flex: 1 }]}>I agree to the library borrowing terms and late-return policy.</Text>
        </Pressable>
        {!!error && <Message error>{error}</Message>}
        <Button busy={busy} icon="arrow-right" onPress={submit}>Create account</Button>
      </Card>
    </AuthTemplate>
  );
}
