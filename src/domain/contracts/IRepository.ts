export interface IRepository<T> {
  save(job: T): void;
  findById(id: string): T | undefined;
  update(id: string, updates: Partial<T>): void;
}