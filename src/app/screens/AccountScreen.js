import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { handleTabBarScroll } from '../utils/tabBarAnimation';
 
// ---------- EDIT THESE WITH YOUR REAL LINKS ----------
const TERMS_URL = 'https://yourapp.com/terms';
const PRIVACY_URL = 'https://yourapp.com/privacy';
const APP_STORE_URL = 'https://play.google.com/store/apps/details?id=com.yourcompany.cnnfarm';
// ------------------------------------------------------
 
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
];
 
const APPEARANCE_OPTIONS = [
  { value: 'light', label: '☀️ Light' },
  { value: 'dark', label: '🌙 Dark' },
  { value: 'system', label: '⚙️ System' },
];
 
const DELIVERY_TIME_OPTIONS = [
  { value: 'morning', label: '☀️ Morning' },
  { value: 'evening', label: '🌙 Evening' },
];
 
const genId = () => Math.random().toString(36).slice(2, 10);
 
export default function AccountScreen() {
  const { themePref, setThemePref, colors } = useTheme();
  const [user, setUser] = useState(null);
 
  // Profile edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
 
  // Change phone
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
 
  // Avatar photo
  const [photoUri, setPhotoUri] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pendingPhotoUri, setPendingPhotoUri] = useState(null); // picked but not yet confirmed
 
  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [addressText, setAddressText] = useState('');
  const [addressInstructions, setAddressInstructions] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
 
  // Delivery time
  const [deliveryTime, setDeliveryTime] = useState('morning');
  const [showDeliveryTimePicker, setShowDeliveryTimePicker] = useState(false);
 
  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
 
  // Appearance
  const [showAppearancePicker, setShowAppearancePicker] = useState(false);
 
  // Language
  const [language, setLanguage] = useState('en');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
 
  // Password
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
 
  useEffect(() => {
    loadUser();
  }, []);
 
  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setName(parsed.name || '');
      setEmail(parsed.email || '');
      setPhone(parsed.phone || '');
      setPhotoUri(parsed.photoUri || null);
      setAddresses(parsed.addresses || []);
      setDeliveryTime(parsed.deliveryTime || 'morning');
      setNotificationsEnabled(parsed.notificationsEnabled ?? true);
      setLanguage(parsed.language || 'en');
    }
  };
 
  const persistUser = async (updates) => {
    const merged = { ...user, ...updates };
    setUser(merged);
    await AsyncStorage.setItem('user', JSON.stringify(merged));
  };
 
  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Name and email are required.');
      return;
    }
    setSavingProfile(true);
    try {
      // TODO: connect to API — e.g. await api.put('/api/auth/profile', { name, email });
      await persistUser({ name: name.trim(), email: email.trim() });
      setEditingProfile(false);
    } catch (err) {
      console.log('PROFILE UPDATE ERROR:', err.message);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };
 
  const handleSavePhone = async () => {
    if (!newPhone.trim() || newPhone.trim().length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    setSavingPhone(true);
    try {
      // TODO: connect to API — typically needs OTP verification
      await persistUser({ phone: newPhone.trim() });
      setPhone(newPhone.trim());
      setEditingPhone(false);
      setNewPhone('');
      Alert.alert('Success', 'Phone number updated.');
    } catch (err) {
      console.log('PHONE UPDATE ERROR:', err.message);
      Alert.alert('Error', 'Failed to update phone number. Please try again.');
    } finally {
      setSavingPhone(false);
    }
  };
 
  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow photo library access to set a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (result.canceled) return;
 
      // Don't save yet — show a preview with our own Done/Cancel controls.
      const uri = result.assets[0].uri;
      setPendingPhotoUri(uri);
    } catch (err) {
      console.log('PHOTO PICKER ERROR:', err.message);
      Alert.alert('Error', 'Something went wrong opening your photo library.');
    }
  };
 
  const handleConfirmPhoto = async () => {
    if (!pendingPhotoUri) return;
    setUploadingPhoto(true);
    try {
      // TODO: connect to API — upload `pendingPhotoUri` and get back a public URL
      setPhotoUri(pendingPhotoUri);
      await persistUser({ photoUri: pendingPhotoUri });
      setPendingPhotoUri(null);
    } catch (err) {
      console.log('PHOTO UPLOAD ERROR:', err.message);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };
 
  const handleCancelPhoto = () => {
    setPendingPhotoUri(null);
  };
 
  const handleRemovePhoto = async () => {
    setPhotoUri(null);
    // TODO: connect to API — e.g. await api.delete('/api/auth/avatar');
    await persistUser({ photoUri: null });
  };
 
  const startAddAddress = () => {
    setEditingAddressId('new');
    setAddressLabel('');
    setAddressText('');
    setAddressInstructions('');
  };
 
  const startEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setAddressText(addr.address);
    setAddressInstructions(addr.instructions || '');
  };
 
  const cancelAddressEdit = () => {
    setEditingAddressId(null);
    setAddressLabel('');
    setAddressText('');
    setAddressInstructions('');
  };
 
  const handleSaveAddress = async () => {
    if (!addressLabel.trim() || !addressText.trim()) {
      Alert.alert('Missing info', 'Please add a label (e.g. Home) and the address.');
      return;
    }
    setSavingAddress(true);
    try {
      let updated;
      if (editingAddressId === 'new') {
        const newAddr = {
          id: genId(),
          label: addressLabel.trim(),
          address: addressText.trim(),
          instructions: addressInstructions.trim(),
          isDefault: addresses.length === 0,
        };
        updated = [...addresses, newAddr];
      } else {
        updated = addresses.map((a) =>
          a.id === editingAddressId
            ? { ...a, label: addressLabel.trim(), address: addressText.trim(), instructions: addressInstructions.trim() }
            : a
        );
      }
      // TODO: connect to API — e.g. await api.put('/api/auth/addresses', { addresses: updated });
      setAddresses(updated);
      await persistUser({ addresses: updated });
      cancelAddressEdit();
    } catch (err) {
      console.log('ADDRESS SAVE ERROR:', err.message);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };
 
  const handleDeleteAddress = (id) => {
    Alert.alert('Delete address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          let updated = addresses.filter((a) => a.id !== id);
          if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
            updated = updated.map((a, i) => (i === 0 ? { ...a, isDefault: true } : a));
          }
          // TODO: connect to API — e.g. await api.put('/api/auth/addresses', { addresses: updated });
          setAddresses(updated);
          await persistUser({ addresses: updated });
        },
      },
    ]);
  };
 
  const handleSetDefaultAddress = async (id) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    // TODO: connect to API — e.g. await api.put('/api/auth/addresses', { addresses: updated });
    setAddresses(updated);
    await persistUser({ addresses: updated });
  };
 
  const handleSetDeliveryTime = async (value) => {
    setDeliveryTime(value);
    setShowDeliveryTimePicker(false);
    try {
      // TODO: connect to API — e.g. await api.put('/api/auth/delivery-time', { deliveryTime: value });
      await persistUser({ deliveryTime: value });
    } catch (err) {
      console.log('DELIVERY TIME UPDATE ERROR:', err.message);
    }
  };
 
  const handleSetAppearance = (value) => {
    setThemePref(value);
    setShowAppearancePicker(false);
  };
 
  const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      // TODO: connect to API — e.g. await api.put('/api/auth/notifications', { enabled: value });
      await persistUser({ notificationsEnabled: value });
    } catch (err) {
      console.log('NOTIFICATION TOGGLE ERROR:', err.message);
    }
  };
 
  const handleSelectLanguage = async (code) => {
    setLanguage(code);
    setShowLanguagePicker(false);
    // TODO: connect to your i18n library (e.g. i18next) to actually switch strings
    await persistUser({ language: code });
  };
 
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing info', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      // TODO: connect to API — e.g. await api.post('/api/auth/change-password', { currentPassword, newPassword });
      Alert.alert('Success', 'Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setEditingPassword(false);
    } catch (err) {
      console.log('PASSWORD CHANGE ERROR:', err.message);
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };
 
  const handleContactUs = () => {
    router.push('/help');
  };
 
  const handleReferFriend = async () => {
    try {
      // TODO: connect to API to fetch a real per-user referral code
      const referralCode = user?.referralCode || (user?.email ? user.email.split('@')[0].toUpperCase() : 'FRIEND');
      await Share.share({
        message: `Join CNN Organic Fresh Farm and get fresh dairy delivered daily! Use my code ${referralCode} to sign up: ${APP_STORE_URL}`,
      });
    } catch (err) {
      console.log('REFER SHARE ERROR:', err.message);
    }
  };
 
  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `Check out CNN Organic Fresh Farm — fresh dairy delivered daily! ${APP_STORE_URL}`,
      });
    } catch (err) {
      console.log('SHARE APP ERROR:', err.message);
    }
  };
 
  const handleOpenTerms = () => Linking.openURL(TERMS_URL);
  const handleOpenPrivacy = () => Linking.openURL(PRIVACY_URL);
 
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Are you absolutely sure?', 'This is your final confirmation.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Yes, Delete My Account',
                style: 'destructive',
                onPress: async () => {
                  try {
                    // TODO: connect to API — e.g. await api.delete('/api/auth/account');
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    router.replace('/auth');
                  } catch (err) {
                    console.log('DELETE ACCOUNT ERROR:', err.message);
                    Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
                  }
                },
              },
            ]);
          },
        },
      ]
    );
  };
 
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/auth');
  };
 
  const onAccountScroll = (e) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    handleTabBarScroll(scrollY);
  };
 
  const isAdmin = user?.role === 'admin';
  const currentLanguageLabel = LANGUAGES.find((l) => l.code === language)?.label || 'English';
  const currentAppearanceLabel = APPEARANCE_OPTIONS.find((o) => o.value === themePref)?.label || '⚙️ System';
  const currentDeliveryTimeLabel = DELIVERY_TIME_OPTIONS.find((o) => o.value === deliveryTime)?.label || '☀️ Morning';
 
  const s = getStyles(colors);
 
  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      onScroll={onAccountScroll}
      scrollEventThrottle={16}>
      <Text style={s.screenTitle}>Account</Text>
 
      {/* PROFILE */}
      <View style={s.profileCard}>
        <TouchableOpacity onPress={handlePickPhoto} disabled={uploadingPhoto} style={s.avatarWrapper}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={s.avatarImage} />
          ) : (
            <View style={s.avatar}>
              <Text style={s.avatarText}>{(user?.name || 'F')[0].toUpperCase()}</Text>
            </View>
          )}
          <View style={s.avatarEditBadge}>
            <Text style={s.avatarEditBadgeText}>{uploadingPhoto ? '…' : '✎'}</Text>
          </View>
        </TouchableOpacity>
 
        {photoUri && (
          <TouchableOpacity onPress={handleRemovePhoto}>
            <Text style={s.removePhotoText}>Remove photo</Text>
          </TouchableOpacity>
        )}
 
        <Modal
          visible={!!pendingPhotoUri}
          transparent
          animationType="fade"
          onRequestClose={handleCancelPhoto}>
          <View style={s.photoPreviewOverlay}>
            <View style={s.photoPreviewCard}>
              <Text style={s.photoPreviewTitle}>Use this photo?</Text>
 
              <View style={s.photoPreviewImageWrapper}>
                {pendingPhotoUri && (
                  <Image source={{ uri: pendingPhotoUri }} style={s.photoPreviewImage} />
                )}
              </View>
 
              <View style={s.photoPreviewActionsRow}>
                <TouchableOpacity
                  style={s.photoPreviewCancelBtn}
                  onPress={handleCancelPhoto}
                  disabled={uploadingPhoto}>
                  <Text style={s.photoPreviewCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.photoPreviewDoneBtn}
                  onPress={handleConfirmPhoto}
                  disabled={uploadingPhoto}>
                  <Text style={s.photoPreviewDoneText}>{uploadingPhoto ? 'Saving…' : 'Done'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
 
        {!editingProfile ? (
          <>
            <Text style={s.name}>{user?.name || 'Friend'}</Text>
            <Text style={s.email}>{user?.email || ''}</Text>
            {!!phone && <Text style={s.email}>{phone}</Text>}
            {isAdmin && (
              <View style={s.adminBadge}>
                <Text style={s.adminBadgeText}>ADMIN</Text>
              </View>
            )}
            <TouchableOpacity style={s.editLink} onPress={() => setEditingProfile(true)}>
              <Text style={s.editLinkText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={s.editForm}>
            <TextInput
              style={s.input}
              placeholder="Full Name"
              placeholderTextColor={colors.textFaint}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor={colors.textFaint}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={s.editActionsRow}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => {
                  setEditingProfile(false);
                  setName(user?.name || '');
                  setEmail(user?.email || '');
                }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSaveProfile} disabled={savingProfile}>
                <Text style={s.saveBtnText}>{savingProfile ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
 
      {/* CHANGE PHONE NUMBER */}
      <View style={s.sectionCard}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionLabel}>📱 Phone Number</Text>
          {!editingPhone && (
            <TouchableOpacity onPress={() => { setEditingPhone(true); setNewPhone(phone); }}>
              <Text style={s.editLinkText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>
        {!editingPhone ? (
          <Text style={s.sectionValue}>{phone || 'No phone number saved'}</Text>
        ) : (
          <View style={s.editForm}>
            <TextInput
              style={s.input}
              placeholder="New Phone Number"
              placeholderTextColor={colors.textFaint}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
            <View style={s.editActionsRow}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => { setEditingPhone(false); setNewPhone(''); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSavePhone} disabled={savingPhone}>
                <Text style={s.saveBtnText}>{savingPhone ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
 
      {/* DELIVERY ADDRESSES */}
      <View style={s.sectionCard}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionLabel}>📍 Delivery Addresses</Text>
          {editingAddressId === null && (
            <TouchableOpacity onPress={startAddAddress}>
              <Text style={s.editLinkText}>+ Add</Text>
            </TouchableOpacity>
          )}
        </View>
 
        {addresses.length === 0 && editingAddressId === null && (
          <Text style={s.sectionSubValue}>No addresses saved yet.</Text>
        )}
 
        {addresses.map((addr) =>
          editingAddressId === addr.id ? (
            <View key={addr.id} style={s.editForm}>
              <TextInput
                style={s.input}
                placeholder="Label (e.g. Home, Work)"
                placeholderTextColor={colors.textFaint}
                value={addressLabel}
                onChangeText={setAddressLabel}
              />
              <TextInput
                style={[s.input, s.multilineInput]}
                placeholder="Full Address"
                placeholderTextColor={colors.textFaint}
                value={addressText}
                onChangeText={setAddressText}
                multiline
              />
              <TextInput
                style={s.input}
                placeholder="Delivery instructions (optional)"
                placeholderTextColor={colors.textFaint}
                value={addressInstructions}
                onChangeText={setAddressInstructions}
              />
              <View style={s.editActionsRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={cancelAddressEdit}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={handleSaveAddress} disabled={savingAddress}>
                  <Text style={s.saveBtnText}>{savingAddress ? 'Saving…' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View key={addr.id} style={s.addressRow}>
              <View style={{ flex: 1 }}>
                <View style={s.addressLabelRow}>
                  <Text style={s.addressLabel}>{addr.label}</Text>
                  {addr.isDefault && (
                    <View style={s.defaultTag}>
                      <Text style={s.defaultTagText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={s.sectionValue}>{addr.address}</Text>
                {!!addr.instructions && (
                  <Text style={s.sectionSubValue}>Note: {addr.instructions}</Text>
                )}
                <View style={s.addressActionsRow}>
                  {!addr.isDefault && (
                    <TouchableOpacity onPress={() => handleSetDefaultAddress(addr.id)}>
                      <Text style={s.smallLinkText}>Set as default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => startEditAddress(addr)}>
                    <Text style={s.smallLinkText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)}>
                    <Text style={[s.smallLinkText, s.deleteLinkText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        )}
 
        {editingAddressId === 'new' && (
          <View style={s.editForm}>
            <TextInput
              style={s.input}
              placeholder="Label (e.g. Home, Work)"
              placeholderTextColor={colors.textFaint}
              value={addressLabel}
              onChangeText={setAddressLabel}
            />
            <TextInput
              style={[s.input, s.multilineInput]}
              placeholder="Full Address"
              placeholderTextColor={colors.textFaint}
              value={addressText}
              onChangeText={setAddressText}
              multiline
            />
            <TextInput
              style={s.input}
              placeholder="Delivery instructions (optional)"
              placeholderTextColor={colors.textFaint}
              value={addressInstructions}
              onChangeText={setAddressInstructions}
            />
            <View style={s.editActionsRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={cancelAddressEdit}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSaveAddress} disabled={savingAddress}>
                <Text style={s.saveBtnText}>{savingAddress ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
 
      {/* DELIVERY TIME PREFERENCE — dropdown, like Language */}
      <View style={s.sectionCard}>
        <TouchableOpacity style={s.sectionHeaderRow} onPress={() => setShowDeliveryTimePicker(!showDeliveryTimePicker)}>
          <Text style={s.sectionLabel}>🕐 Delivery Time Preference</Text>
          <Text style={s.sectionValue}>{currentDeliveryTimeLabel} {showDeliveryTimePicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>
 
        {showDeliveryTimePicker && (
          <View style={{ marginTop: 12 }}>
            {DELIVERY_TIME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={s.languageRow}
                onPress={() => handleSetDeliveryTime(opt.value)}>
                <Text style={s.languageRowText}>{opt.label}</Text>
                {deliveryTime === opt.value && <Text style={s.languageCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
 
      {/* SETTINGS */}
      <Text style={s.groupTitle}>Settings</Text>
 
      {/* APPEARANCE — dropdown, like Language */}
      <View style={s.sectionCard}>
        <TouchableOpacity style={s.sectionHeaderRow} onPress={() => setShowAppearancePicker(!showAppearancePicker)}>
          <Text style={s.sectionLabel}>🎨 Appearance</Text>
          <Text style={s.sectionValue}>{currentAppearanceLabel} {showAppearancePicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>
 
        {showAppearancePicker && (
          <View style={{ marginTop: 12 }}>
            {APPEARANCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={s.languageRow}
                onPress={() => handleSetAppearance(opt.value)}>
                <Text style={s.languageRowText}>{opt.label}</Text>
                {themePref === opt.value && <Text style={s.languageCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
 
      <View style={s.sectionCard}>
        <TouchableOpacity style={s.sectionHeaderRow} onPress={() => setShowLanguagePicker(!showLanguagePicker)}>
          <Text style={s.sectionLabel}>🌐 App Language</Text>
          <Text style={s.sectionValue}>{currentLanguageLabel} {showLanguagePicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>
 
        {showLanguagePicker && (
          <View style={{ marginTop: 12 }}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity key={lang.code} style={s.languageRow} onPress={() => handleSelectLanguage(lang.code)}>
                <Text style={s.languageRowText}>{lang.label}</Text>
                {language === lang.code && <Text style={s.languageCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
 
      <View style={s.sectionCard}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionLabel}>🔔 Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#ddd', true: 'rgba(232,163,61,0.5)' }}
            thumbColor={notificationsEnabled ? '#E8A33D' : '#f4f3f4'}
          />
        </View>
        <Text style={s.sectionSubValue}>Get updates on orders, delivery, and offers.</Text>
      </View>
 
      {/* PAYMENT METHODS */}
      <View style={s.sectionCard}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionLabel}>💳 Payment Methods</Text>
        </View>
        <Text style={s.sectionSubValue}>No payment methods saved yet.</Text>
        <TouchableOpacity
          style={s.editLink}
          onPress={() => {
            // TODO: connect to a payment provider SDK once decided
            Alert.alert('Coming soon', 'Add payment method flow goes here.');
          }}>
          <Text style={s.editLinkText}>+ Add Payment Method</Text>
        </TouchableOpacity>
      </View>
 
      {/* CHANGE PASSWORD */}
      <View style={s.sectionCard}>
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionLabel}>🔒 Password</Text>
          {!editingPassword && (
            <TouchableOpacity onPress={() => setEditingPassword(true)}>
              <Text style={s.editLinkText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>
 
        {editingPassword && (
          <View style={s.editForm}>
            <TextInput
              style={s.input}
              placeholder="Current Password"
              placeholderTextColor={colors.textFaint}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={s.input}
              placeholder="New Password"
              placeholderTextColor={colors.textFaint}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={s.input}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.textFaint}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <View style={s.editActionsRow}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => {
                  setEditingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleChangePassword} disabled={savingPassword}>
                <Text style={s.saveBtnText}>{savingPassword ? 'Saving…' : 'Update'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
 
      {/* MENU LINKS */}
      <Text style={s.groupTitle}>General</Text>
      <View style={s.menuList}>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/orders')}>
          <Text style={s.menuIcon}>📦</Text>
          <Text style={s.menuText}>My Orders</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/subscription')}>
          <Text style={s.menuIcon}>🔄</Text>
          <Text style={s.menuText}>Manage Subscription</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={handleContactUs}>
          <Text style={s.menuIcon}>💬</Text>
          <Text style={s.menuText}>Contact Us</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/help')}>
          <Text style={s.menuIcon}>❓</Text>
          <Text style={s.menuText}>Help</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/book-call')}>
          <Text style={s.menuIcon}>📅</Text>
          <Text style={s.menuText}>Book a Call</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuItem} onPress={handleReferFriend}>
          <Text style={s.menuIcon}>🎁</Text>
          <Text style={s.menuText}>Refer a Friend</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.menuItem, s.menuItemLast]} onPress={handleShareApp}>
          <Text style={s.menuIcon}>📤</Text>
          <Text style={s.menuText}>Share the App</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      </View>
 
      {/* LEGAL */}
      <Text style={s.groupTitle}>Legal</Text>
      <View style={s.menuList}>
        <TouchableOpacity style={s.menuItem} onPress={handleOpenTerms}>
          <Text style={s.menuIcon}>📄</Text>
          <Text style={s.menuText}>Terms and Conditions</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.menuItem, s.menuItemLast]} onPress={handleOpenPrivacy}>
          <Text style={s.menuIcon}>🔐</Text>
          <Text style={s.menuText}>Privacy Policy</Text>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      </View>
 
      {isAdmin && (
        <View style={s.menuList}>
          <TouchableOpacity style={[s.menuItem, s.menuItemLast]} onPress={() => router.push('/admin-dashboard')}>
            <Text style={s.menuIcon}>🛡️</Text>
            <Text style={s.menuText}>Admin Dashboard</Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      )}
 
      <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
        <Text style={s.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
 
      {/* DANGER ZONE */}
      <Text style={s.groupTitle}>Danger Zone</Text>
      <TouchableOpacity style={s.deleteAccountButton} onPress={handleDeleteAccount}>
        <Text style={s.deleteAccountText}>Delete My Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
 
function getStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
    screenTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
 
    groupTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
      marginTop: 6,
    },
 
    profileCard: { alignItems: 'center', marginBottom: 20 },
    avatarWrapper: { position: 'relative', marginBottom: 8 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(232,163,61,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(232,163,61,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 1,
      borderColor: 'rgba(232,163,61,0.4)',
    },
    avatarText: { fontSize: 30, fontWeight: 'bold', color: colors.accent },
    avatarEditBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
    avatarEditBadgeText: { color: '#0a0a0a', fontSize: 12, fontWeight: 'bold' },
    removePhotoText: { color: colors.danger, fontSize: 12, fontWeight: '600', marginBottom: 8 },
 
    photoPreviewOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    photoPreviewCard: {
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    photoPreviewTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
    photoPreviewImageWrapper: { position: 'relative', marginBottom: 16 },
    photoPreviewImage: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: 'rgba(232,163,61,0.4)',
    },
    photoPreviewActionsRow: { flexDirection: 'row', width: '100%' },
    photoPreviewCancelBtn: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 12,
      marginRight: 8,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    photoPreviewCancelText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
    photoPreviewDoneBtn: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    photoPreviewDoneText: { color: '#0a0a0a', fontWeight: 'bold', fontSize: 14 },
 
    name: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 6 },
    email: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    adminBadge: {
      marginTop: 10,
      backgroundColor: 'rgba(232,163,61,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(232,163,61,0.35)',
      borderRadius: 20,
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    adminBadgeText: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
 
    editLink: { marginTop: 10 },
    editLinkText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
 
    editForm: { width: '100%', marginTop: 10 },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
      marginBottom: 10,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    multilineInput: { minHeight: 60, textAlignVertical: 'top' },
    editActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
    cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
    cancelBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
    saveBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
    saveBtnText: { color: '#0a0a0a', fontWeight: 'bold', fontSize: 14 },
 
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionLabel: { fontSize: 15, fontWeight: 'bold', color: colors.text },
    sectionValue: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    sectionSubValue: { fontSize: 13, color: colors.textFaint, marginTop: 4 },
 
    addressRow: { flexDirection: 'row', paddingTop: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
    addressLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    addressLabel: { fontSize: 14, fontWeight: 'bold', color: colors.text, marginRight: 8 },
    defaultTag: {
      backgroundColor: 'rgba(232,163,61,0.15)',
      borderRadius: 8,
      paddingVertical: 2,
      paddingHorizontal: 8,
    },
    defaultTagText: { color: colors.accent, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
    addressActionsRow: { flexDirection: 'row', marginTop: 8 },
    smallLinkText: { color: colors.accent, fontSize: 12, fontWeight: '700', marginRight: 16 },
    deleteLinkText: { color: colors.danger },
 
    languageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    languageRowText: { fontSize: 14, color: colors.text, fontWeight: '600' },
    languageCheck: { color: colors.accent, fontWeight: 'bold', fontSize: 16 },
 
    menuList: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemLast: { borderBottomWidth: 0 },
    menuIcon: { fontSize: 18, marginRight: 14 },
    menuText: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
    chevron: { color: colors.textFaint, fontSize: 20, fontWeight: '300' },
 
    logoutButton: {
      backgroundColor: 'rgba(255,68,68,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255,68,68,0.25)',
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 24,
    },
    logoutText: { color: colors.danger, fontSize: 15, fontWeight: 'bold' },
 
    deleteAccountButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    deleteAccountText: { color: colors.danger, fontSize: 14, fontWeight: 'bold' },
  });
}