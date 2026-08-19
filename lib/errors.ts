export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class UpstreamError extends Error {
  constructor(resource: string, status: number) {
    super(`Failed to fetch ${resource} (status ${status})`);
    this.name = "UpstreamError";
  }
}
