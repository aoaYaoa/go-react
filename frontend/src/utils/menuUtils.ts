import type { Menu } from '../types'

/**
 * 扩展的菜单类型，包含 children 属性
 */
export interface MenuTreeNode extends Menu {
  children?: MenuTreeNode[]
}

/**
 * 将后端菜单数据转换为树形结构
 * @param menus 扁平的菜单列表
 * @returns 树形菜单结构
 */
export function buildMenuTree(menus: Menu[]): MenuTreeNode[] {
  if (!menus || menus.length === 0) {
    return []
  }

  // 创建 ID 到菜单的映射
  const menuMap = new Map<string, MenuTreeNode>()
  menus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] })
  })

  // 构建树形结构
  const tree: MenuTreeNode[] = []
  menus.forEach(menu => {
    const menuItem = menuMap.get(menu.id)
    if (!menuItem) return

    if (menu.parent_id) {
      // 有父级，添加到父级的 children
      const parent = menuMap.get(menu.parent_id)
      if (parent && parent.children) {
        parent.children.push(menuItem)
      }
    } else {
      // 无父级，是顶级菜单
      tree.push(menuItem)
    }
  })

  // 按 sort 字段排序
  const sortMenus = (items: MenuTreeNode[]): MenuTreeNode[] => {
    return items.sort((a, b) => a.sort - b.sort).map(item => {
      if (item.children && item.children.length > 0) {
        return { ...item, children: sortMenus(item.children) }
      }
      return item
    })
  }

  return sortMenus(tree)
}

/**
 * 检查菜单项是否有权限访问
 * @param menu 菜单项
 * @param userMenus 用户拥有的菜单列表
 * @returns 是否有权限
 */
export function hasMenuPermission(menu: MenuTreeNode, userMenus: Menu[]): boolean {
  return userMenus.some(m => m.id === menu.id)
}

/**
 * 过滤菜单树，只保留用户有权限的菜单
 * @param menuTree 菜单树
 * @param userMenus 用户拥有的菜单列表
 * @returns 过滤后的菜单树
 */
export function filterMenuTree(menuTree: MenuTreeNode[], userMenus: Menu[]): MenuTreeNode[] {
  return menuTree
    .filter(menu => hasMenuPermission(menu, userMenus))
    .map(menu => {
      if (menu.children && menu.children.length > 0) {
        return {
          ...menu,
          children: filterMenuTree(menu.children, userMenus)
        }
      }
      return menu
    })
}
