declare module "stats.js" {
  class Stats {
    showPanel(mode: number): void;
    dom: HTMLElement;
    end(): void;
    begin(): void;
  }

  export default Stats;
}
