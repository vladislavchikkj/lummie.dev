// src/components/tree-view.tsx
import { TreeItem } from '@/types'
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
} from '@/components/ui/sidebar'
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Импортируем компоненты контекстного меню
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  FileIcon as FilePlusIcon, // Переименуем для избежания конфликта
  FolderPlusIcon,
  PenLineIcon,
  Trash2Icon,
} from 'lucide-react'

interface TreeViewProps {
  data: TreeItem[]
  value: string | null
  onSelect?: (value: string) => void
  onFileOperation: (
    type: 'create' | 'rename' | 'delete',
    path: string,
    newPath?: string,
    itemType?: 'file' | 'folder'
  ) => void // Новое свойство
}

export const TreeView = ({
  data,
  value,
  onSelect,
  onFileOperation,
}: TreeViewProps) => {
  // Добавляем onFileOperation
  return (
    <SidebarProvider>
      <Sidebar
        collapsible="none"
        className="flex h-full w-full flex-col border-none"
      >
        <SidebarContent className="min-h-0 flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Добавляем ContextMenuTrigger вокруг всего содержимого TreeView, чтобы можно было создавать в корне */}
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <div className="text-muted-foreground p-2 text-sm">
                      {/* Опционально: можно добавить сюда "Создать файл/папку" в корне */}
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() =>
                        onFileOperation('create', '', undefined, 'file')
                      }
                    >
                      <FilePlusIcon className="mr-2 h-4 w-4" /> New File
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() =>
                        onFileOperation('create', '', undefined, 'folder')
                      }
                    >
                      <FolderPlusIcon className="mr-2 h-4 w-4" /> New Folder
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                {data.map((item, index) => (
                  <Tree
                    key={index}
                    item={item}
                    selectedValue={value}
                    onSelect={onSelect}
                    parentPath=""
                    onFileOperation={onFileOperation} // Передаем дальше
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

interface TreeProps {
  item: TreeItem
  selectedValue: string | null
  onSelect?: (value: string) => void
  parentPath: string
  onFileOperation: (
    type: 'create' | 'rename' | 'delete',
    path: string,
    newPath?: string,
    itemType?: 'file' | 'folder'
  ) => void // Новое свойство
}

const Tree = ({
  item,
  selectedValue,
  onSelect,
  parentPath,
  onFileOperation,
}: TreeProps) => {
  const [name, ...items] = Array.isArray(item) ? item : [item]
  const currentPath = parentPath ? `${parentPath}/${name}` : name

  // Это файл
  if (!items.length) {
    const isSelected = selectedValue === currentPath

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <SidebarMenuButton
            isActive={isSelected}
            className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground flex cursor-pointer items-center gap-2"
            onClick={() => onSelect?.(currentPath)}
          >
            <FileIcon className="h-4 w-4" />
            <span className="truncate">{name}</span>
          </SidebarMenuButton>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => onFileOperation('rename', currentPath)}
          >
            <PenLineIcon className="mr-2 h-4 w-4" /> Rename File
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => onFileOperation('delete', currentPath)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" /> Delete File
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  // Это папка
  return (
    <SidebarMenuItem className="w-full">
      <Collapsible className="group/collapsible w-full [&[data-state=open]>div>button>svg:first-child]:rotate-90">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex items-center">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="flex w-full items-center gap-2">
                  <ChevronRightIcon className="h-4 w-4 transition-transform" />
                  <FolderIcon className="h-4 w-4 group-data-[state=open]/collapsible:hidden" />
                  <FolderOpenIcon className="hidden h-4 w-4 group-data-[state=open]/collapsible:block" />
                  <span className="truncate">{name}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() =>
                onFileOperation('create', currentPath, undefined, 'file')
              }
            >
              <FilePlusIcon className="mr-2 h-4 w-4" /> New File
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() =>
                onFileOperation('create', currentPath, undefined, 'folder')
              }
            >
              <FolderPlusIcon className="mr-2 h-4 w-4" /> New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => onFileOperation('rename', currentPath)}
            >
              <PenLineIcon className="mr-2 h-4 w-4" /> Rename Folder
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onFileOperation('delete', currentPath)}
            >
              <Trash2Icon className="mr-2 h-4 w-4" /> Delete Folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem}
                selectedValue={selectedValue}
                onSelect={onSelect}
                parentPath={currentPath}
                onFileOperation={onFileOperation} // Передаем дальше
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
