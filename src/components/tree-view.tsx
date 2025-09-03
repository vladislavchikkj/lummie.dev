import { TreeItem } from "@/types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TreeViewProps {
  data: TreeItem[];
  value: string | null;
  onSelect?: (value: string) => void;
}

export const TreeView = ({ data, value, onSelect }: TreeViewProps) => {
  return (
    <SidebarProvider>
      <Sidebar
        collapsible="none"
        className="w-full h-full border-none flex flex-col"
      >
        <SidebarContent className="flex-1 min-h-0">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.map((item, index) => (
                  <Tree
                    key={index}
                    item={item}
                    selectedValue={value}
                    onSelect={onSelect}
                    parentPath=""
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};

interface TreeProps {
  item: TreeItem;
  selectedValue: string | null;
  onSelect?: (value: string) => void;
  parentPath: string;
}

const Tree = ({ item, selectedValue, onSelect, parentPath }: TreeProps) => {
  const [name, ...items] = Array.isArray(item) ? item : [item];
  const currentPath = parentPath ? `${parentPath}/${name}` : name;

  // Это файл
  if (!items.length) {
    const isSelected = selectedValue === currentPath;

    return (
      <SidebarMenuButton
        isActive={isSelected}
        className="flex items-center gap-2 cursor-pointer data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        onClick={() => onSelect?.(currentPath)}
      >
        <FileIcon className="h-4 w-4" />
        <span className="truncate">{name}</span>
      </SidebarMenuButton>
    );
  }

  // Это папка
  return (
    <SidebarMenuItem className="w-full">
      <Collapsible className="group/collapsible w-full [&[data-state=open]>div>button>svg:first-child]:rotate-90">
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="flex items-center gap-2 w-full">
              <ChevronRightIcon className="transition-transform h-4 w-4" />
              <FolderIcon className="h-4 w-4 group-data-[state=open]/collapsible:hidden" />
              <FolderOpenIcon className="h-4 w-4 hidden group-data-[state=open]/collapsible:block" />
              <span className="truncate">{name}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem}
                selectedValue={selectedValue}
                onSelect={onSelect}
                parentPath={currentPath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};
