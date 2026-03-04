// Template registry - maps industry slugs to template components
// Each factory client gets a template based on their industry

import { PoolServiceLayout } from "./pool-service/pool-layout";

export const templateRegistry: Record<
  string,
  {
    component: typeof PoolServiceLayout;
    name: string;
    description: string;
  }
> = {
  "pool-service": {
    component: PoolServiceLayout,
    name: "Pool Service",
    description: "Professional pool cleaning and maintenance website",
  },
};

export function getTemplate(industry: string) {
  return templateRegistry[industry] ?? null;
}
