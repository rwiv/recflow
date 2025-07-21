export interface Task {
  name: string;
  run(): Promise<any>;
}
