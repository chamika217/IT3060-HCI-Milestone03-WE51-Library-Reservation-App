import { useLibrary } from '@/state/library';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Icon, Message, u } from '@/components/library/ui';
import AuthTemplate from '@/components/library/AuthTemplate';
import { palette as c } from '@/constants/design-system';
export default function Signup() {
  const { register, pendingGoogle, completeGoogleRegistration, clearGoogleRegistration } = useLibrary(); const [busy, setBusy] = useState(false);
  const [name, setName] = useState(''), [student, setStudent] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [department, setDepartment] = useState(''), [accepted, setAccepted] = useState(false), [error, setError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const studentError = student.trim().length === 10 ? '' : 'Student / staff ID must contain exactly 10 characters.';
  const normalizedEmail = (pendingGoogle?.email || email).trim().toLowerCase();
  const emailError = normalizedEmail.length <= 254 && /^[^\s@]+@(my\.sliit\.lk|gmail\.com)$/.test(normalizedEmail)
    ? '' : 'Use a valid email ending in @my.sliit.lk or @gmail.com.';
  const passwordError = password.length === 0
    ? 'Enter a password.'
    : password.length < 8
      ? 'Password must contain at least 8 characters.'
      : !/[a-z]/.test(password) || !/[A-Z]/.test(password)
        ? 'Password must include at least one uppercase and one lowercase letter.'
        : '';
  const confirmationError = !confirmPassword
    ? 'Confirm your password.'
    : confirmPassword !== password ? 'Passwords do not match.' : '';
  async function submit() {
    if (busy) return;
    setSubmitted(true);
    if (studentError) {
      setError('');
      return;
    }
    if (emailError) {
      setError(pendingGoogle ? emailError : '');
      return;
    }
    if (!pendingGoogle && (passwordError || confirmationError)) {
      setError('');
      return;
    }
    const completeProfile = student.trim() && department.trim() && accepted;
    const validPassword = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password);
    const completePasswordSignup = name.trim() && !emailError && validPassword;
    if (!completeProfile || (!pendingGoogle && !completePasswordSignup)) {
      setError(pendingGoogle
        ? 'Enter your student or staff ID and department, then accept the borrowing terms.'
        : passwordError || 'Complete all required fields and accept the borrowing terms.');
      return;
    }
    setBusy(true); setError('');
    try {
      if (pendingGoogle) await completeGoogleRegistration({ credential: pendingGoogle.credential, studentId: student, department, acceptedTerms: accepted });
      else await register({ name, studentId: student, department, email: normalizedEmail, password, acceptedTerms: accepted });
      setPassword(''); setConfirmPassword(''); router.replace('/home');
    } catch (e) { setError(e instanceof Error ? e.message : 'Registration failed.'); }
    finally { setBusy(false); }
  }
  return (
    <AuthTemplate
      accessLabel="STUDENT & STAFF ACCESS"
      accessBadge={pendingGoogle ? 'Google sign-up' : 'New member'}
      footer={(
        <View style={[u.row, { justifyContent: 'center', flexWrap: 'wrap' }]}>
          <Text style={u.small}>{pendingGoogle ? 'Want to use another sign-in method?' : 'Already have an account?'}</Text>
          <Pressable onPress={() => { if (pendingGoogle) clearGoogleRegistration(); router.replace('/login'); }}><Text style={[u.link, { color: c.primary }]}>{pendingGoogle ? 'Back to sign in' : 'Sign in'}</Text></Pressable>
        </View>
      )}
    >
      <Card style={{ padding: 32, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={u.title}>{pendingGoogle ? 'Finish your library profile.' : 'Create your account.'}</Text>
          <Text style={u.body}>{pendingGoogle ? `Signed in as ${pendingGoogle.email}. Add your library details to continue.` : 'Use your university details to join the library.'}</Text>
        </View>
        {!pendingGoogle && <Field label="FULL NAME" placeholder="Alex Morgan" value={name} onChangeText={setName} autoComplete="name" style={{ backgroundColor: c.primarySoft }} />}
        <Field label="STUDENT / STAFF ID" placeholder="IT20240001" value={student} onChangeText={value => { setStudent(value); setError(''); }} style={{ backgroundColor: c.primarySoft }} />
        <Text style={u.caption}>Exactly 10 characters (for example, IT20240001).</Text>
        {!!studentError && (submitted || student.length > 0) && <Message error>{studentError}</Message>}
        {!pendingGoogle && <>
          <Field label="EMAIL ADDRESS" placeholder="you@my.sliit.lk or you@gmail.com" value={email} onChangeText={value => { setEmail(value); setError(''); }} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={{ backgroundColor: c.primarySoft }} />
          {!!emailError && (submitted || email.length > 0) && <Message error>{emailError}</Message>}
        </>}
        <Field label="DEPARTMENT / FACULTY" placeholder="School of Computing" value={department} onChangeText={setDepartment} style={{ backgroundColor: c.primarySoft }} />
        {!pendingGoogle && <>
          <Field label="PASSWORD" placeholder="Enter a password" value={password} onChangeText={value => { setPassword(value); setError(''); }} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" style={{ backgroundColor: c.primarySoft }} />
          <Text style={u.caption}>Use at least 8 characters, including an uppercase and a lowercase letter.</Text>
          {!!passwordError && (submitted || password.length > 0) && <Message error>{passwordError}</Message>}
          <Field label="CONFIRM PASSWORD" placeholder="Re-enter your password" value={confirmPassword} onChangeText={value => { setConfirmPassword(value); setError(''); }} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" style={{ backgroundColor: c.primarySoft }} />
          {!!confirmationError && (submitted || confirmPassword.length > 0) && <Message error>{confirmationError}</Message>}
        </>}
        <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={u.row}>
          <Icon name={accepted ? 'check-square' : 'square'} color={accepted ? c.primary : c.secondary} />
          <Text style={[u.small, { flex: 1 }]}>I agree to the library borrowing terms and late-return policy.</Text>
        </Pressable>
        {!!error && <Message error>{error}</Message>}
        <Button busy={busy} icon="arrow-right" onPress={submit}>{pendingGoogle ? 'Finish Google sign-up' : 'Create account'}</Button>
      </Card>
    </AuthTemplate>
  );
}
