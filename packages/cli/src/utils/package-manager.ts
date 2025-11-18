import { execa } from 'execa';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export class PackageManagerUtils {
  static async detect(): Promise<PackageManager> {
    if (await this.isInstalled('pnpm')) {
      return 'pnpm';
    }
    if (await this.isInstalled('yarn')) {
      return 'yarn';
    }
    return 'npm';
  }

  static async isInstalled(pm: PackageManager): Promise<boolean> {
    try {
      await execa(pm, ['--version'], { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  static async install(pm: PackageManager, cwd: string): Promise<void> {
    const isInstalled = await this.isInstalled(pm);
    
    if (!isInstalled) {
      throw new Error(
        `${pm} is not installed. Please install it first:\n` +
        `npm install -g ${pm === 'npm' ? 'npm' : pm}`
      );
    }

    await execa(pm, ['install'], { cwd, stdio: 'inherit' });
  }

  static getInstallCommand(pm: PackageManager): string {
    return `${pm} install`;
  }

  static getRunCommand(pm: PackageManager, script: string): string {
    if (pm === 'npm') {
      return `npm run ${script}`;
    }
    return `${pm} ${script}`;
  }
}
