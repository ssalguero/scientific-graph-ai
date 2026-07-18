/**
 * D45.3 smoke — S1 buttons + S2 panel layout render via SSR markup.
 */
import { renderToStaticMarkup } from "react-dom/server";

import {
  DangerButton,
  GhostButton,
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from "../src/components/ui/buttons";
import {
  Divider,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  SectionTitle,
} from "../src/components/ui/layout";
import { getIcon } from "../src/lib/ui/icons";

const buttonsMarkup = renderToStaticMarkup(
  <div data-testid="s1-buttons">
    <PrimaryButton data-testid="primary-button">Primary</PrimaryButton>
    <SecondaryButton data-testid="secondary-button">Secondary</SecondaryButton>
    <GhostButton data-testid="ghost-button">Ghost</GhostButton>
    <IconButton data-testid="icon-button" aria-label="icon">
      {getIcon("settings")}
    </IconButton>
    <DangerButton data-testid="danger-button">Danger</DangerButton>
  </div>
);

const panelMarkup = renderToStaticMarkup(
  <Panel data-testid="s2-panel" variant="content">
    <PanelHeader data-testid="panel-header">
      <SectionTitle data-testid="section-title" subtitle="Subtitle">
        Title
      </SectionTitle>
    </PanelHeader>
    <PanelBody data-testid="panel-body">Body</PanelBody>
    <Divider data-testid="divider" />
    <PanelFooter data-testid="panel-footer">Footer</PanelFooter>
  </Panel>
);

const s1 = {
  primary: buttonsMarkup.includes('data-testid="primary-button"'),
  secondary: buttonsMarkup.includes('data-testid="secondary-button"'),
  ghost: buttonsMarkup.includes('data-testid="ghost-button"'),
  icon: buttonsMarkup.includes('data-testid="icon-button"'),
  danger: buttonsMarkup.includes('data-testid="danger-button"'),
  primaryLabel: buttonsMarkup.includes("Primary"),
  dangerLabel: buttonsMarkup.includes("Danger"),
};

const s2 = {
  panel: panelMarkup.includes('data-testid="s2-panel"'),
  header: panelMarkup.includes('data-testid="panel-header"'),
  body: panelMarkup.includes('data-testid="panel-body"'),
  footer: panelMarkup.includes('data-testid="panel-footer"'),
  sectionTitle: panelMarkup.includes('data-testid="section-title"'),
  divider: panelMarkup.includes('data-testid="divider"'),
  titleText: panelMarkup.includes("Title"),
  bodyText: panelMarkup.includes("Body"),
};

const s1Pass = Object.values(s1).every(Boolean);
const s2Pass = Object.values(s2).every(Boolean);

const summary = {
  phase: "ui-button-panel-smoke",
  pass: s1Pass && s2Pass,
  S1: { pass: s1Pass, checks: s1 },
  S2: { pass: s2Pass, checks: s2 },
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.pass ? 0 : 1);
