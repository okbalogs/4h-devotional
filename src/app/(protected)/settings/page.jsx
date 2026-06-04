"use client"
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/utils/supabase'

const BIBLE_VERSIONS = [
  { code: 'kjv', label: 'KJV' },
  { code: 'web', label: 'WEB' },
  { code: 'asv', label: 'ASV' },
]

export default function Settings() {
  const { user, logout } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)

  // Password change state (#6)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [changingPassword, setChangingPassword] = useState(false)

  // Track original profile data for discard (#7)
  const originalProfileRef = useRef(null)
  // Track original bible version for feedback (#8)
  const originalBibleVersionRef = useRef('web')

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [church, setChurch] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)

  // Preferences
  const [bibleVersion, setBibleVersion] = useState('web')
  const [reminders, setReminders] = useState(true)
  const [reminderTime, setReminderTime] = useState('06:00')
  const [notifPermission, setNotifPermission] = useState('default')
  const [publicProfile, setPublicProfile] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState(true)
  const [communityPrayers, setCommunityPrayers] = useState(false)

  useEffect(() => {
    if ('Notification' in window) setNotifPermission(Notification.permission)
  }, [])

  useEffect(() => {
    if (!user) return
    setFullName(user.user_metadata?.full_name ?? '')

    supabase
      .from('profiles')
      .select('avatar_url, bible_version, church, reminders_enabled, reminder_time, public_profile, weekly_summary, community_prayers')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data) return
        if (data.avatar_url) setAvatarUrl(data.avatar_url)
        if (data.bible_version) setBibleVersion(data.bible_version)
        if (data.church) setChurch(data.church)
        setReminders(data.reminders_enabled ?? true)
        setReminderTime(data.reminder_time ?? '06:00')
        setPublicProfile(data.public_profile ?? false)
        setWeeklySummary(data.weekly_summary ?? true)
        setCommunityPrayers(data.community_prayers ?? false)

        // Store original values for discard (#7)
        originalProfileRef.current = {
          fullName: user.user_metadata?.full_name ?? '',
          church: data.church ?? '',
          bibleVersion: data.bible_version ?? 'web',
          reminders: data.reminders_enabled ?? true,
          reminderTime: data.reminder_time ?? '06:00',
          publicProfile: data.public_profile ?? false,
          weeklySummary: data.weekly_summary ?? true,
          communityPrayers: data.community_prayers ?? false,
        }
        // Track original bible version for feedback (#8)
        originalBibleVersionRef.current = data.bible_version ?? 'web'
      })
  }, [user])

  const handleReminderToggle = async () => {
    if (reminders) {
      // Turning OFF
      setReminders(false)
      localStorage.setItem('notif_enabled', 'false')
      return
    }
    // Turning ON — request permission first
    if (!('Notification' in window)) {
      setSaveMsg('Your browser does not support notifications.')
      setTimeout(() => setSaveMsg(null), 3000)
      return
    }
    if (Notification.permission === 'denied') {
      setSaveMsg('Notifications are blocked. Please enable them in your browser settings.')
      setTimeout(() => setSaveMsg(null), 4000)
      return
    }
    const perm = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission()
    setNotifPermission(perm)
    if (perm !== 'granted') {
      setSaveMsg('Notification permission not granted.')
      setTimeout(() => setSaveMsg(null), 3000)
      return
    }
    setReminders(true)
    localStorage.setItem('notif_enabled', 'true')
    localStorage.setItem('notif_time', reminderTime)
  }

  const handleReminderTimeChange = (t) => {
    setReminderTime(t)
    if (reminders) localStorage.setItem('notif_time', t)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg(null)

    const [authResult, profileResult] = await Promise.all([
      supabase.auth.updateUser({ data: { full_name: fullName } }),
      supabase.from('profiles').upsert({
        id: user.id,
        bible_version: bibleVersion,
        church,
        reminders_enabled: reminders,
        reminder_time: reminderTime,
        public_profile: publicProfile,
        weekly_summary: weeklySummary,
        community_prayers: communityPrayers,
        updated_at: new Date().toISOString(),
      }),
    ])

    const error = authResult.error || profileResult.error
    setSaving(false)

    if (error) {
      setSaveMsg(error.message)
    } else {
      // Bible version feedback (#8)
      const versionChanged = bibleVersion !== originalBibleVersionRef.current
      setSaveMsg(versionChanged
        ? 'Changes saved. Your verse will refresh on next visit.'
        : 'Changes saved.')
      // Update originals so subsequent discards reflect the saved state
      originalProfileRef.current = {
        fullName, church, bibleVersion, reminders, reminderTime,
        publicProfile, weeklySummary, communityPrayers,
      }
      originalBibleVersionRef.current = bibleVersion
    }
    setTimeout(() => setSaveMsg(null), 4000)

    // Keep localStorage in sync so NotificationScheduler works offline
    if (!error) {
      localStorage.setItem('notif_enabled', reminders ? 'true' : 'false')
      localStorage.setItem('notif_time', reminderTime)
    }
  }

  const handleDiscard = () => {
    const orig = originalProfileRef.current
    if (orig) {
      setFullName(orig.fullName)
      setChurch(orig.church)
      setBibleVersion(orig.bibleVersion)
      setReminders(orig.reminders)
      setReminderTime(orig.reminderTime)
      setPublicProfile(orig.publicProfile)
      setWeeklySummary(orig.weeklySummary)
      setCommunityPrayers(orig.communityPrayers)
    } else {
      setFullName(user?.user_metadata?.full_name ?? '')
      setChurch('')
    }
    setSaveMsg(null)
  }

  // In-app password change (#6)
  const handlePasswordChange = async () => {
    setPasswordMsg(null)
    if (!newPassword || !confirmPassword) {
      setPasswordMsg('Please fill in both fields.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match.')
      return
    }
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setChangingPassword(false)
    if (error) {
      setPasswordMsg(error.message)
    } else {
      setPasswordMsg('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowPasswordForm(false)
        setPasswordMsg(null)
      }, 2500)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    setSaveMsg(null)

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setSaveMsg(uploadError.message)
      setUploadingPhoto(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    await supabase.from('profiles').upsert({
      id: user.id,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })

    setAvatarUrl(publicUrl)
    setSaveMsg('Photo updated.')
    setTimeout(() => setSaveMsg(null), 3000)
    setUploadingPhoto(false)
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
      </header>

      <div className="tab-content" style={{ animation: 'fadeIn 0.3s ease' }}>

          {/* Profile Management */}
          <section className="settings-section">
            <h2 className="section-title">Profile Management</h2>
            <div className="card-soft profile-card" style={{ background: '#fff' }}>
              <div className="avatar-upload">
                <img
                  src={avatarUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || user?.email || 'U')}&background=9d4f14&color=fff`}
                  alt="Profile"
                />
                <button
                  className="update-photo-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? 'UPLOADING...' : 'UPDATE PHOTO'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="profile-form">
                <div className="form-row">
                  <div>
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-soft"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input type="email" className="input-soft" value={user?.email ?? ''} disabled />
                  </div>
                </div>
                <div>
                  <label className="input-label">Church / Denomination (Optional)</label>
                  <input
                    type="text"
                    className="input-soft"
                    placeholder="e.g. ECWA Central, Abuja"
                    value={church}
                    onChange={(e) => setChurch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Daily Selah */}
          <section className="settings-section">
            <h2 className="section-title">Daily Selah</h2>
            <div className="cards-grid">
              <div className="mini-card">
                <div className="mini-card-header">
                  <div className="circle-icon">🔔</div>
                  <div className={`toggle-switch ${reminders ? 'on' : ''}`} onClick={handleReminderToggle} />
                </div>
                <div>
                  <h3>Daily Reminders</h3>
                  <p>Receive a gentle nudge for your morning devotion.</p>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-card-header">
                  <div className="circle-icon">📖</div>
                </div>
                <div>
                  <h3>Bible Version</h3>
                  <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '8px' }}>KJV · WEB · ASV</p>
                  <div className="pill-selector">
                    {BIBLE_VERSIONS.map(({ code, label }) => (
                      <span
                        key={code}
                        className={`pill ${bibleVersion === code ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setBibleVersion(code)}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-card-header">
                  <div className="circle-icon">👁️</div>
                  <div className={`toggle-switch ${publicProfile ? 'on' : ''}`} onClick={() => setPublicProfile(v => !v)} />
                </div>
                <div>
                  <h3>Public Profile</h3>
                  <p>Allow church members to find you and share prayer requests.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="settings-section">
            <h2 className="section-title">Notifications</h2>
            <div className="cards-grid">
              <div className="mini-card">
                <div className="mini-card-header">
                  <div className="circle-icon">⏰</div>
                </div>
                <div>
                  <h3>Morning Devotion</h3>
                  <p>Set your preferred time for daily morning reminders.</p>
                  <input
                    type="time"
                    className="input-soft"
                    value={reminderTime}
                    onChange={(e) => handleReminderTimeChange(e.target.value)}
                    style={{ marginTop: '12px', padding: '6px 12px' }}
                  />
                  {notifPermission === 'denied' && (
                    <p style={{ fontSize: '0.78rem', color: '#c0392b', marginTop: '6px' }}>
                      Notifications are blocked in your browser.
                    </p>
                  )}
                  {reminders && notifPermission === 'granted' && (
                    <p style={{ fontSize: '0.78rem', color: '#2d6a4f', marginTop: '6px' }}>
                      ✓ You&apos;ll be reminded at {reminderTime} each day.
                    </p>
                  )}
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-card-header">
                  <div className="circle-icon">📊</div>
                  <div className={`toggle-switch ${weeklySummary ? 'on' : ''}`} onClick={() => setWeeklySummary(v => !v)} />
                </div>
                <div>
                  <h3>Weekly Summary</h3>
                  <p>Get a recap of your journaling consistency every Sunday.</p>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-card-header">
                  <div className="circle-icon">🤲</div>
                  <div className={`toggle-switch ${communityPrayers ? 'on' : ''}`} onClick={() => setCommunityPrayers(v => !v)} />
                </div>
                <div>
                  <h3>Community Prayers</h3>
                  <p>Receive alerts when members share new prayer requests.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Account Security */}
          <section className="settings-section">
            <h2 className="section-title">Account Security</h2>
            <div className="card-strong">
              <div className="flex-between">
                <div className="gap-12">
                  <div className="circle-icon circle-icon-white">🔑</div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#333' }}>Update Your Password</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Update your credentials to keep your journal private.</p>
                  </div>
                </div>
                <div className="flex-between gap-12">
                  <button className="btn-white" onClick={() => setShowPasswordForm(v => !v)}>
                    {showPasswordForm ? 'Cancel' : 'Update Password'}
                  </button>
                  <button className="btn-danger-light" onClick={logout}>↳ Logout</button>
                </div>
              </div>

              {showPasswordForm && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(157, 79, 20, 0.15)' }}>
                  <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div>
                      <label className="input-label">New Password</label>
                      <input
                        type="password"
                        className="input-soft"
                        placeholder="Min. 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="input-label">Confirm Password</label>
                      <input
                        type="password"
                        className="input-soft"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  {passwordMsg && (
                    <p style={{
                      fontSize: '0.85rem',
                      marginBottom: '12px',
                      color: passwordMsg.includes('successfully') ? '#2b7a3b' : '#c0392b',
                    }}>
                      {passwordMsg}
                    </p>
                  )}
                  <button
                    className="btn-primary"
                    style={{ border: 'none', padding: '10px 20px', borderRadius: '8px', background: '#9d4f14', color: '#fff', fontWeight: 600 }}
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Updating...' : 'Save New Password'}
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="action-footer">
            {saveMsg && (
              <span style={{ fontSize: '0.85rem', color: saveMsg === 'Changes saved.' ? '#2b7a3b' : '#c0392b' }}>
                {saveMsg}
              </span>
            )}
            <button className="btn-text" onClick={handleDiscard}>Discard Changes</button>
            <button
              className="btn-primary"
              style={{ border: 'none', padding: '12px 24px', borderRadius: '8px', background: '#9d4f14', color: '#fff', fontWeight: 600 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
    </div>
  )
}
