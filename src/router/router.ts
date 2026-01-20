import type { Route } from '../types/index.ts';

export interface RouteConfig {
  path: string;
  route: Route;
}

type RouteChangeHandler = (route: Route, params: Record<string, string>) => void;

const routes: RouteConfig[] = [
  { path: '', route: 'start' },
  { path: '/', route: 'start' },
  { path: '/wizard', route: 'wizard' },
  { path: '/options', route: 'options' },
  { path: '/character', route: 'character' },
];

class Router {
  private handlers: RouteChangeHandler[] = [];
  private currentRoute: Route = 'start';
  private currentParams: Record<string, string> = {};

  constructor() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    window.addEventListener('load', () => this.handleHashChange());
  }

  private parseHash(): { path: string; params: Record<string, string> } {
    const hash = window.location.hash.slice(1);
    const [path, queryString] = hash.split('?');
    const params: Record<string, string> = {};

    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    return { path: path || '/', params };
  }

  private handleHashChange() {
    const { path, params } = this.parseHash();
    const routeConfig = routes.find((r) => r.path === path);
    const route = routeConfig?.route ?? 'start';

    this.currentRoute = route;
    this.currentParams = params;

    this.handlers.forEach((handler) => handler(route, params));
  }

  subscribe(handler: RouteChangeHandler): () => void {
    this.handlers.push(handler);
    handler(this.currentRoute, this.currentParams);

    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  navigate(route: Route, params: Record<string, string> = {}) {
    const routeConfig = routes.find((r) => r.route === route);
    if (!routeConfig) return;

    let hash = routeConfig.path;
    const queryString = new URLSearchParams(params).toString();
    if (queryString) {
      hash += '?' + queryString;
    }

    window.location.hash = hash;
  }

  getCurrentRoute(): Route {
    return this.currentRoute;
  }

  getParams(): Record<string, string> {
    return { ...this.currentParams };
  }
}

export const router = new Router();
