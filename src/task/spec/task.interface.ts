export interface Task {
  name: string;
  delay: number | null;
  run(args: any): Promise<any>;
}
