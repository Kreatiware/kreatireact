import type { Preview } from '@storybook/react';
import '../../../packages/react/src/styles/variables.css';
import '../../../packages/react/src/styles/reset.css';
import '../../../packages/react/src/themes/all.css';
import '../../../packages/layout/src/index.css';
import '../../../packages/react/src/components/NavigationBar.css';
import '../../../packages/react/src/components/Badge.css';
import '../../../packages/react/src/components/Button.css';
import '../../../packages/react/src/components/HeroSection.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;