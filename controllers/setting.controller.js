import Settings from '../models/setting.model.js';

// @desc    Get current theme settings (Public)
// @route   GET /api/settings/theme
export const getThemeSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({
        themeMode: 'light',
        primaryAccent: '#2874f0',
        secondaryAccent: '#ff9f00'
      });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update theme settings (Admin Only)
// @route   PUT /api/settings/theme
export const updateThemeSettings = async (req, res) => {
  try {
    const { themeMode, primaryAccent, secondaryAccent } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (themeMode) settings.themeMode = themeMode;
    if (primaryAccent) settings.primaryAccent = primaryAccent;
    if (secondaryAccent) settings.secondaryAccent = secondaryAccent;

    const updatedSettings = await settings.save();
    res.status(200).json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};