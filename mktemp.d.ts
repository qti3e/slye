declare module "mktemp" {
  function createDir(template: string): Promise<string>;
}
