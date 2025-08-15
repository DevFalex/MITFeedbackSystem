export type SidebarLink = {
  label: string;
  route: string;
  roles: string[]; // ['ALL'] for everyone, or role names for specific roles
  icon?: React.ReactNode; // optionally add icons here
};

export const sidebarLinks: SidebarLink[] = [
  // Dashboard Group
  { label: 'Dashboard', route: '/dashboard', roles: ['ALL'] },
  // Feedback Group
  { label: 'Submit Feedback', route: '/submit-feedback', roles: ['ALL'] },
  { label: 'My Submissions', route: '/myfeeds', roles: ['ALL'] },
  {
    label: 'All Feedback',
    route: 'all-feedback',
    roles: ['ADMIN', 'MIT_CORDINATOR'],
  },
  {
    label: 'My Assigned Feedback',
    route: '/assigned-feedback',
    roles: ['ADMIN', 'MIT_CORDINATOR', 'LECTURER'],
  },
  {
    label: 'Assign Feedback',
    route: '/assign-feedback',
    roles: ['ADMIN', 'MIT_CORDINATOR'],
  },
  {
    label: 'Respond to Feedback',
    route: '/respond-feedback',
    roles: ['ADMIN', 'MIT_CORDINATOR'],
  },
  {
    label: 'Update Status',
    route: '/feedback/update-status',
    roles: ['ADMIN', 'MIT_CORDINATOR'],
  },
  // Management Group
  { label: 'User Management', route: '/user-management', roles: ['ADMIN'] },
  {
    label: 'Reports & Analytics',
    route: '/reports',
    roles: ['ADMIN', 'MIT_CORDINATOR', 'LECTURER'],
  },
  // Misc Group
  { label: 'Notifications', route: '/notifications', roles: ['ALL'] },
  { label: 'Profile', route: '/profile', roles: ['ALL'] },
  { label: 'Help / FAQ', route: '/help', roles: ['ALL'] },
  { label: 'Settings', route: '/settings', roles: ['ADMIN'] },
  { label: 'Audit Trail', route: '/audit', roles: ['ADMIN'] },
  { label: 'Logout', route: '/logout', roles: ['ALL'] },
];
