interface AssetsEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export declare const withRange: (request: Request, response: Response) => Promise<Response>;

declare const worker: { fetch(request: Request, env: AssetsEnv): Promise<Response> };
export default worker;
