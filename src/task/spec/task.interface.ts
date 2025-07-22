export interface Task {
  name: string;
  run(args: any): Promise<any>;
}
