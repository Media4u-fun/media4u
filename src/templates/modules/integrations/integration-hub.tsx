"use client";

import { Plug, ExternalLink, CheckCircle, Circle } from "lucide-react";

interface Integration {
  key: string;
  name: string;
  description: string;
  icon?: string;
  connected: boolean;
  category: string;
}

interface IntegrationHubProps {
  integrations: Integration[];
  onConnect?: (key: string) => void;
  onDisconnect?: (key: string) => void;
}

export function IntegrationHub({
  integrations,
  onConnect,
  onDisconnect,
}: IntegrationHubProps) {
  const categories = [...new Set(integrations.map((i) => i.category))];

  return (
    <div className="py-12 px-6 md:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Plug className="w-5 h-5 text-cyan-400" />
          <h2 className="text-2xl font-display font-bold">Integrations</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-8">
          Connect external services to extend your site.
        </p>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              {category}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations
                .filter((i) => i.category === category)
                .map((integration) => (
                  <div
                    key={integration.key}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">{integration.name}</h4>
                      {integration.connected ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mb-4">
                      {integration.description}
                    </p>
                    <button
                      onClick={() =>
                        integration.connected
                          ? onDisconnect?.(integration.key)
                          : onConnect?.(integration.key)
                      }
                      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                        integration.connected
                          ? "text-red-400 hover:text-red-300"
                          : "text-cyan-400 hover:text-cyan-300"
                      }`}
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
