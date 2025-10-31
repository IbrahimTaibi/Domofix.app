import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'provider';
  isEmailVerified: boolean;
  avatar?: string;
  profilePicture?: string;
  bio?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  notificationPreferences?: {
    email: {
      marketing: boolean;
      security: boolean;
      updates: boolean;
      bookings: boolean;
    };
    push: {
      messages: boolean;
      bookings: boolean;
      reminders: boolean;
      marketing: boolean;
    };
    sms: {
      bookings: boolean;
      reminders: boolean;
      security: boolean;
    };
  };
  privacySettings?: {
    profileVisibility: 'public' | 'private' | 'contacts';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
    allowBookings: boolean;
    dataCollection: boolean;
    marketingEmails: boolean;
    thirdPartySharing: boolean;
    activityTracking: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['customer', 'provider'],
    required: [true, 'Role is required']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: null
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  socialMedia: {
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    website: { type: String, trim: true }
  },
  notificationPreferences: {
    email: {
      marketing: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
      updates: { type: Boolean, default: true },
      bookings: { type: Boolean, default: true }
    },
    push: {
      messages: { type: Boolean, default: true },
      bookings: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    sms: {
      bookings: { type: Boolean, default: true },
      reminders: { type: Boolean, default: false },
      security: { type: Boolean, default: true }
    }
  },
  privacySettings: {
    profileVisibility: { 
      type: String, 
      enum: ['public', 'private', 'contacts'], 
      default: 'public' 
    },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    allowMessages: { type: Boolean, default: true },
    allowBookings: { type: Boolean, default: true },
    dataCollection: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    thirdPartySharing: { type: Boolean, default: false },
    activityTracking: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Prevent model re-compilation during development
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;