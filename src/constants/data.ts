import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['a', 'd'],
    items: [
      {
        title: 'Overview',
        url: '/dashboard/overview',
        icon: 'dashboard',
        shortcut: ['o', 'v']
      },
      {
        title: 'Activity Log',
        url: '/admin/dashboard/activity',
        icon: 'employee',
        shortcut: ['a', 'l']
      },
      {
        title: 'College Stats',
        url: '/admin/dashboard/college-stats',
        icon: 'analytics',
        shortcut: ['c', 's']
      }
    ]
  },
  {
    title: 'Users',
    url: '/admin/users/all',
    icon: 'user',
    isActive: false,
    shortcut: ['u', 's'],
    items: [
      {
        title: 'All Users',
        url: '/admin/users/all',
        icon: 'user',
        shortcut: ['a', 'u']
      },
     
    ]
  },
  {
    title: 'Colleges',
    url: '/admin/colleges',
    icon: 'building',
    isActive: false,
    shortcut: ['c', 'l'],
    items: [
      {
        title: 'College List',
        url: '/admin/colleges',
        icon: 'user',
        shortcut: ['l', 'c']
      },
      {
        title: 'Add Colleges',
        url: '/admin/colleges/add',
        icon: 'kanban',
        shortcut: ['j', 'd']
      },
     
    ]
  },
  {
    title: 'Exams',
    url: '/admin/exams',
    icon: 'page',
    isActive: false,
    shortcut: ['e', 'x'],
    items: [
      {
        title: 'Exam List',
        url: '/admin/exams/list',
        icon: 'kanban',
        shortcut: ['l', 'e']
      },
       {
        title: 'Add Exam ',
        url: '/admin/exams/add',
        icon: 'add',
        shortcut: ['l', 'e']
      }
    ]
  },
  {
    title: 'Predictions',
    url: '/admin/predictions/',
    icon: 'chart',
    isActive: false,
    shortcut: ['p', 'r'],
    items: [
      {
        title: 'JOSAA Predictions',
        url: '/admin/predictions/josaa',
        icon: 'chart',
        shortcut: ['d', 'p']
      },
      {
        title: 'TNEA Predictions',
        url: '/admin/predictions/tnea',
        icon: 'chart',
        shortcut: ['e', 'p']
      }
    ]
  },{
  title: 'Updates',
  url: '/updates',
  icon: 'messages',
  isActive: false,
  shortcut: ['u', 'p'],
  items: [
    {
      title: 'Post Updates',
      url: '/updates',
      icon: 'post',
      shortcut: ['g', 'u']
    }
    
   
  ]
}
,
  {
    title: 'Logs',
    url: '/logs',
    icon: 'post',
    isActive: false,
    shortcut: ['l', 'g'],
    items: [
      {
        title: 'User Activity',
        url: '/logs',
        icon: 'employee',
        shortcut: ['u', 'a']
      },
      {
        title: 'College Views',
        url: '/admin/logs/college-views',
        icon: 'employee',
        shortcut: ['c', 'v']
      },
      {
        title: 'Prediction Logs',
        url: '/admin/logs/predictions',
        icon: 'chart',
        shortcut: ['p', 'l']
      }
    ]
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: 'settings',
    isActive: false,
    shortcut: ['s', 't'],
    items: [
       {
        title: 'General',
        url: '/settings',
        icon: 'userCheck',
        shortcut: ['r', 'a']
      },
      {
        title: 'Roles & Access',
        url: '/settings/roles',
        icon: 'userCheck',
        shortcut: ['r', 'a']
      },
      {
        title: 'Website Config',
        url: '/settings/config',
        icon: 'settings',
        shortcut: ['w', 'c']
      }
    ]
  }
];
