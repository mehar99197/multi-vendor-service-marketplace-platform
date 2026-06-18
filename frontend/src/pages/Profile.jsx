import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { uploadImage } from '../api/upload';
import PasswordInput from '../components/common/PasswordInput';
import { Reveal } from '../components/common/Motion';

function Input({ label, value, onChange, type = 'text', error, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-white/5 border ${
          error ? 'border-red-500' : 'border-white/10'
        } rounded-xl text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40`}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function ExperienceItem({ exp, index, onChange, onRemove }) {
  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-300">Experience #{index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300 text-sm transition-colors"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Title" value={exp.title} onChange={(e) => onChange(index, 'title', e.target.value)} />
        <Input label="Company" value={exp.company} onChange={(e) => onChange(index, 'company', e.target.value)} />
        <Input label="From" type="date" value={exp.from} onChange={(e) => onChange(index, 'from', e.target.value)} />
        <Input
          label="To"
          type="date"
          value={exp.to}
          onChange={(e) => onChange(index, 'to', e.target.value)}
          disabled={exp.current}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`current-${index}`}
          checked={exp.current || false}
          onChange={(e) => onChange(index, 'current', e.target.checked)}
          className="rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor={`current-${index}`} className="text-sm text-gray-300">Current position</label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={exp.description || ''}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>
    </div>
  );
}

function PortfolioItem({ item, index, onChange, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadImage(file, 'portfolio');
      onChange(index, 'imageUrl', url);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-300">Portfolio #{index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300 text-sm transition-colors"
        >
          Remove
        </button>
      </div>
      <Input label="Title" value={item.title} onChange={(e) => onChange(index, 'title', e.target.value)} />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={item.description || ''}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Image</label>
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover border border-white/10" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center text-xs text-gray-400">none</div>
          )}
          <label className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-colors">
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
          </label>
        </div>
        {uploadError && <p className="mt-1 text-sm text-red-400">{uploadError}</p>}
      </div>
      <Input label="Link" value={item.link || ''} onChange={(e) => onChange(index, 'link', e.target.value)} />
    </div>
  );
}

export default function Profile() {
  const { user, loadUser } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileFormErrors, setProfileFormErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [providerProfile, setProviderProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [pricing, setPricing] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [providerMessage, setProviderMessage] = useState('');
  const [providerError, setProviderError] = useState('');
  const [savingProvider, setSavingProvider] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(false);

  const isProvider = user?.role === 'provider';

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');
      if (isProvider) {
        fetchProviderProfile();
      }
    }
  }, [user]);

  const fetchProviderProfile = async () => {
    setLoadingProvider(true);
    try {
      const res = await api.get(`/providers/${user._id || user.id}`);
      const data = res.data.provider || res.data;
      setProviderProfile(data);
      setBio(data.bio || '');
      setSkills(data.skills || []);
      setExperience(data.experience || []);
      setPricing(data.pricing?.startingFrom ?? data.startingFrom ?? '');
      // backend stores portfolio image under `image`; the form binds to `imageUrl`
      setPortfolio((data.portfolio || []).map((p) => ({ ...p, imageUrl: p.imageUrl || p.image || '' })));
    } catch (err) {
      if (err.response?.status !== 404) {
        setProviderError('Failed to load provider profile');
      }
    } finally {
      setLoadingProvider(false);
    }
  };

  const validateProfile = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email format';
    if (!currentPassword) errors.currentPassword = 'Enter your current password to save changes';
    setProfileFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setProfileMessage('');
    setProfileError('');
    try {
      const url = await uploadImage(file, 'avatars');
      await api.put('/auth/profile', { avatar: url });
      setAvatar(url);
      if (loadUser) await loadUser();
      setProfileMessage('Profile picture updated');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to upload picture');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setSavingProfile(true);
    setProfileMessage('');
    setProfileError('');
    try {
      await api.put('/auth/profile', { name, email, currentPassword });
      setCurrentPassword('');
      if (loadUser) await loadUser();
      setProfileMessage('Profile updated successfully');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const addSkill = () => {
    const trimmed = skillsInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillsInput('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const addExperience = () => {
    setExperience([...experience, { title: '', company: '', from: '', to: '', current: false, description: '' }]);
  };

  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handlePortfolioChange = (index, field, value) => {
    const updated = [...portfolio];
    updated[index] = { ...updated[index], [field]: value };
    setPortfolio(updated);
  };

  const addPortfolio = () => {
    setPortfolio([...portfolio, { title: '', description: '', imageUrl: '', link: '' }]);
  };

  const removePortfolio = (index) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  const handleProviderSave = async (e) => {
    e.preventDefault();
    setSavingProvider(true);
    setProviderMessage('');
    setProviderError('');
    try {
      const data = {
        bio,
        skills,
        experience,
        pricing: { startingFrom: Number(pricing) || 0, currency: 'USD' },
        portfolio: portfolio.map((p) => ({ ...p, image: p.imageUrl })),
      };
      await api.put('/providers/profile', data);
      setProviderMessage('Provider profile updated successfully');
    } catch (err) {
      setProviderError(err.response?.data?.message || 'Failed to update provider profile');
    } finally {
      setSavingProvider(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Reveal className="mb-8">
          <h1 className="text-3xl font-bold text-gradient">Profile Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account and provider information</p>
        </Reveal>

        <Reveal className="mb-8">
        <div className="glass rounded-2xl p-6 transition-all hover:-translate-y-0.5">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt={user?.name} className="w-16 h-16 rounded-full object-cover border border-white/10" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold glow-indigo">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-indigo-500/20 text-indigo-300 border-indigo-500/50 capitalize">
                {user?.role}
              </span>
              <div className="mt-2">
                <label className="cursor-pointer text-sm text-indigo-400 hover:text-indigo-300">
                  {avatarUploading ? 'Uploading...' : 'Change profile picture'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {profileMessage && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm">
              {profileMessage}
            </div>
          )}
          {profileError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={profileFormErrors.name}
              placeholder="Your full name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={profileFormErrors.email}
              placeholder="your@email.com"
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required to change your name or email"
                className={`w-full px-4 py-2.5 bg-white/5 border ${
                  profileFormErrors.currentPassword ? 'border-red-500' : 'border-white/10'
                } rounded-xl text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40`}
              />
              {profileFormErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-400">{profileFormErrors.currentPassword}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                For your security, confirm your current password to update your name or email.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-xl font-medium transition-all glow-indigo"
              >
                {savingProfile ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </span>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
        </Reveal>

        {isProvider && (
          <Reveal>
          <div className="glass rounded-2xl p-6 transition-all hover:-translate-y-0.5">
            <h2 className="text-xl font-semibold mb-6">Provider Profile</h2>

            {providerMessage && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm">
                {providerMessage}
              </div>
            )}
            {providerError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {providerError}
              </div>
            )}

            {providerProfile && (providerProfile.averageRating !== undefined || providerProfile.rating !== undefined) && (
              <div className="flex items-center gap-6 mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <p className="text-sm text-gray-400">Average Rating</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {(providerProfile.averageRating || providerProfile.rating || 0).toFixed(1)} / 5
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Reviews</p>
                  <p className="text-xl font-bold text-white">{providerProfile.reviewCount || providerProfile.reviews?.length || 0}</p>
                </div>
              </div>
            )}

            {loadingProvider ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
              </div>
            ) : (
              <form onSubmit={handleProviderSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell clients about yourself and your expertise..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Type a skill and press Enter or Add"
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-medium transition-all glow-indigo"
                    >
                      Add
                    </button>
                  </div>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-full text-sm border border-indigo-500/30"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(i)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Experience</label>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-colors"
                    >
                      + Add Experience
                    </button>
                  </div>
                  <div className="space-y-3">
                    {experience.length === 0 ? (
                      <p className="text-sm text-gray-500">No experience added yet</p>
                    ) : (
                      experience.map((exp, i) => (
                        <ExperienceItem
                          key={i}
                          exp={exp}
                          index={i}
                          onChange={handleExperienceChange}
                          onRemove={removeExperience}
                        />
                      ))
                    )}
                  </div>
                </div>

                <Input
                  label="Starting From Price ($)"
                  type="number"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  placeholder="e.g. 50"
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Portfolio</label>
                    <button
                      type="button"
                      onClick={addPortfolio}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-colors"
                    >
                      + Add Portfolio Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {portfolio.length === 0 ? (
                      <p className="text-sm text-gray-500">No portfolio items added yet</p>
                    ) : (
                      portfolio.map((item, i) => (
                        <PortfolioItem
                          key={i}
                          item={item}
                          index={i}
                          onChange={handlePortfolioChange}
                          onRemove={removePortfolio}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={savingProvider}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-xl font-medium transition-all glow-indigo"
                  >
                    {savingProvider ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </span>
                    ) : (
                      'Save Provider Profile'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
