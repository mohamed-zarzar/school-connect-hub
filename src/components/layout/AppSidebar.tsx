import {
  Users, GraduationCap, UserCog, UserCheck, Layers, BookOpen, Settings, LayoutDashboard, School,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: GraduationCap },
  { title: "Teachers", url: "/teachers", icon: BookOpen },
  { title: "Managers", url: "/managers", icon: UserCog },
  { title: "Parents", url: "/parents", icon: Users },
];

const structureItems = [
  { title: "Classes", url: "/classes", icon: School },
  { title: "Levels", url: "/levels", icon: Layers },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
];

const settingsItems = [
  { title: "Custom Fields", url: "/settings/custom-fields", icon: Settings },
];

const MenuGroup = ({ label, items }: { label: string; items: typeof mainItems }) => (
  <SidebarGroup>
    <SidebarGroupLabel>{label}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <NavLink to={item.url} end={item.url === "/dashboard"} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">EduManager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <MenuGroup label="Main" items={mainItems} />
        <MenuGroup label="Structure" items={structureItems} />
        <MenuGroup label="Settings" items={settingsItems} />
      </SidebarContent>
    </Sidebar>
  );
}
