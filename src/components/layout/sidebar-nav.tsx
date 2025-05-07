'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Layers,
  Edit3,
  HelpCircle,
  Calendar,
  MessageSquare,
  Settings,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/homework', label: 'Homework', icon: Edit3 },
  { href: '/quiz', label: 'Quizzes', icon: HelpCircle },
  { href: '/deadlines', label: 'Deadlines', icon: Calendar },
  { href: '/chat', label: 'Chatbot', icon: MessageSquare },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <SidebarMenu>
      {mainNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              as="a"
              isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function SidebarFooterNav() {
  const pathname = usePathname();
   return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/settings" passHref legacyBehavior>
          <SidebarMenuButton
            as="a"
            isActive={pathname === '/settings'}
            tooltip="Settings"
          >
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
