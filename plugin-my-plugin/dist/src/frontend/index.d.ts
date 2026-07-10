import "./index.css";
import React from "react";
export interface AgentPanel {
    name: string;
    path: string;
    component: React.ComponentType<{
        agentId?: string;
    } & Record<string, unknown>>;
    icon?: string;
    public?: boolean;
    shortLabel?: string;
}
export declare const panels: AgentPanel[];
export * from "./utils";
//# sourceMappingURL=index.d.ts.map