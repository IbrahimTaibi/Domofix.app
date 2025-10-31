import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileHeader from '@/components/profile/profile-header';
import ProfileInfo from '@/components/profile/profile-info';
import AccountSettings from '@/components/profile/account-settings';
import { User } from '@/types';

// Mock user data
const mockUser: User = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  role: 'customer',
  isEmailVerified: true,
  bio: 'Software developer passionate about creating great user experiences.',
  socialMedia: {
    linkedin: 'https://linkedin.com/in/johndoe',
    twitter: 'https://twitter.com/johndoe'
  },
  notificationPreferences: {
    email: {
      marketing: true,
      security: true,
      updates: true,
      bookings: true
    },
    push: {
      messages: true,
      bookings: true,
      reminders: true,
      marketing: false
    },
    sms: {
      bookings: true,
      reminders: true,
      security: true
    }
  },
  privacySettings: {
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    allowMessages: true,
    allowBookings: true,
    dataCollection: false,
    marketingEmails: true,
    thirdPartySharing: false,
    activityTracking: false
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

// Mock fetch globally
global.fetch = jest.fn();

describe('Profile Components', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('ProfileHeader', () => {
    it('renders user information correctly', () => {
      render(<ProfileHeader user={mockUser} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('customer')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText(mockUser.bio!)).toBeInTheDocument();
    });

    it('displays user initials when no profile picture', () => {
      render(<ProfileHeader user={mockUser} />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('shows edit profile picture button', () => {
      render(<ProfileHeader user={mockUser} />);
      
      const editButton = screen.getByLabelText('Edit profile picture');
      expect(editButton).toBeInTheDocument();
    });

    it('opens profile picture upload modal when edit button clicked', () => {
      render(<ProfileHeader user={mockUser} />);
      
      const editButton = screen.getByLabelText('Edit profile picture');
      fireEvent.click(editButton);
      
      // Modal should be rendered (ProfilePictureUpload component)
      expect(screen.getByText('Upload Profile Picture')).toBeInTheDocument();
    });
  });

  describe('ProfileInfo', () => {
    it('renders personal information section', () => {
      render(<ProfileInfo user={mockUser} />);
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
    });

    it('shows edit button for personal information', () => {
      render(<ProfileInfo user={mockUser} />);
      
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('displays social media links when available', () => {
      render(<ProfileInfo user={mockUser} />);
      
      expect(screen.getByText('Social Media')).toBeInTheDocument();
    });
  });

  describe('AccountSettings', () => {
    it('renders account settings sections', () => {
      render(<AccountSettings user={mockUser} />);
      
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Security Overview')).toBeInTheDocument();
      expect(screen.getByText('Account Actions')).toBeInTheDocument();
    });

    it('shows change password button', () => {
      render(<AccountSettings user={mockUser} />);
      
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('shows notification settings button', () => {
      render(<AccountSettings user={mockUser} />);
      
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    });

    it('shows privacy settings button', () => {
      render(<AccountSettings user={mockUser} />);
      
      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    });

    it('opens change password modal when button clicked', () => {
      render(<AccountSettings user={mockUser} />);
      
      const changePasswordButton = screen.getByText('Change Password');
      fireEvent.click(changePasswordButton);
      
      expect(screen.getByText('Change Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on interactive elements', () => {
      render(<ProfileHeader user={mockUser} />);
      
      expect(screen.getByLabelText('Edit profile picture')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit profile information')).toBeInTheDocument();
    });

    it('has proper alt text for profile images', () => {
      const userWithImage = { ...mockUser, profilePicture: '/test-image.jpg' };
      render(<ProfileHeader user={userWithImage} />);
      
      const profileImage = screen.getByAltText('Profile picture of John Doe');
      expect(profileImage).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<ProfileInfo user={mockUser} />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      const { container } = render(<ProfileHeader user={mockUser} />);
      
      // Check for responsive classes
      expect(container.querySelector('.sm\\:h-32')).toBeInTheDocument();
      expect(container.querySelector('.sm\\:px-6')).toBeInTheDocument();
      expect(container.querySelector('.sm\\:flex-row')).toBeInTheDocument();
    });
  });
});