/** Component registry — maps component names to React components. */

import type { ComponentRegistration } from './types.js';

// ── Leo-specific self-updating ──
import { LeoStatus } from './components/LeoStatus.js';
import { OllamaMonitor } from './components/OllamaMonitor.js';
import { GatewayLog } from './components/GatewayLog.js';
import { CostMeter } from './components/CostMeter.js';
import { SystemHealth } from './components/SystemHealth.js';
import { Clock } from './components/Clock.js';

// ── Leo-specific agent-pushed ──
import { TaskCard } from './components/TaskCard.js';
import { ApprovalCard } from './components/ApprovalCard.js';
import { AlertBanner } from './components/AlertBanner.js';

// ── Standard agent-pushed (from Rex Canvas Kit) ──
import { StatusCard } from './components/StatusCard.js';
import { QuickAction } from './components/QuickAction.js';
import { TextBlock } from './components/TextBlock.js';
import { DataTable } from './components/DataTable.js';
import { ProgressBar } from './components/ProgressBar.js';
import { BarChart } from './components/BarChart.js';
import { Form } from './components/Form.js';
import { ListCard } from './components/ListCard.js';

const REGISTRY: ComponentRegistration[] = [
  // ── Self-updating ──
  {
    name: 'LeoStatus',
    description: 'Leo agent status: model, session, gateway health. No props.',
    component: LeoStatus,
  },
  {
    name: 'OllamaMonitor',
    description: 'Currently loaded Ollama model + runtime stats. No props.',
    component: OllamaMonitor,
  },
  {
    name: 'GatewayLog',
    description: 'Recent gateway errors and warnings from today\'s log. Props: limit?',
    component: GatewayLog,
  },
  {
    name: 'CostMeter',
    description: 'Daily/monthly API spend vs budget limits. No props.',
    component: CostMeter,
  },
  {
    name: 'SystemHealth',
    description: 'Live CPU, RAM, disk bars. No props.',
    component: SystemHealth,
  },
  {
    name: 'Clock',
    description: 'Self-updating clock and date. Props: timezone?',
    component: Clock,
  },
  // ── Leo agent-pushed ──
  {
    name: 'TaskCard',
    description: 'Task with status badge, description, and optional step list. Props: title, status, description?, steps?, priority?',
    component: TaskCard,
  },
  {
    name: 'ApprovalCard',
    description: 'Approval request with Approve/Deny buttons. Fires callback on decision. Props: title, description?, command?, risk?',
    component: ApprovalCard,
  },
  {
    name: 'AlertBanner',
    description: 'Highlighted alert/blocker. Props: message, severity (info|warning|error), details?',
    component: AlertBanner,
  },
  // ── Standard ──
  {
    name: 'StatusCard',
    description: 'Labeled value with icon and color. Props: title, value, icon?, color?, subtitle?',
    component: StatusCard,
  },
  {
    name: 'QuickAction',
    description: 'Touch button that fires a callback. Props: label, icon?, color?, action?',
    component: QuickAction,
  },
  {
    name: 'TextBlock',
    description: 'Text display (body/code/quote). Props: text, heading?, variant?',
    component: TextBlock,
  },
  {
    name: 'DataTable',
    description: 'Table with column headers and rows. Props: title?, columns, rows',
    component: DataTable,
  },
  {
    name: 'ProgressBar',
    description: 'Horizontal progress bar. Props: label, value, max?, color?, showPercent?',
    component: ProgressBar,
  },
  {
    name: 'BarChart',
    description: 'SVG bar chart. Props: title?, data ({label, value, color?}[]), height?',
    component: BarChart,
  },
  {
    name: 'Form',
    description: 'Agent-generated form. Props: title?, fields, submitLabel?',
    component: Form,
  },
  {
    name: 'ListCard',
    description: 'List with optional title. Props: title?, items ({text, icon?, color?}[]), ordered?',
    component: ListCard,
  },
];

const REGISTRY_MAP = new Map(REGISTRY.map((r) => [r.name, r]));

export function getComponent(name: string): ComponentRegistration | undefined {
  return REGISTRY_MAP.get(name);
}

export function getAllComponents(): ComponentRegistration[] {
  return REGISTRY;
}
