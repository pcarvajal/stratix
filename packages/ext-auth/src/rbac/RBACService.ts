import type { Role, User } from '../types.js';

export class RBACService {
  private roles: Map<string, Role> = new Map();

  constructor(roles: Role[] = []) {
    roles.forEach((role) => this.addRole(role));
  }

  addRole(role: Role): void {
    this.roles.set(role.name, role);
  }

  getRole(name: string): Role | undefined {
    return this.roles.get(name);
  }

  getRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  hasRole(user: User, roleName: string): boolean {
    return user.roles.includes(roleName);
  }

  hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  hasPermissionForResource(user: User, resource: string, action: string): boolean {
    const permission = `${action}:${resource}`;
    return this.hasPermission(user, permission);
  }

  hasAnyRole(user: User, roleNames: string[]): boolean {
    return roleNames.some((roleName) => this.hasRole(user, roleName));
  }

  hasAllRoles(user: User, roleNames: string[]): boolean {
    return roleNames.every((roleName) => this.hasRole(user, roleName));
  }

  hasAnyPermission(user: User, permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(user, permission));
  }

  hasAllPermissions(user: User, permissions: string[]): boolean {
    return permissions.every((permission) => this.hasPermission(user, permission));
  }

  getUserPermissions(user: User): string[] {
    const rolePermissions = user.roles
      .map((roleName) => this.getRole(roleName))
      .filter((role): role is Role => role !== undefined)
      .flatMap((role) => role.permissions);

    return Array.from(new Set([...user.permissions, ...rolePermissions]));
  }
}
