import type { Preview } from '@storybook/react';
import '../../../packages/react/src/styles/variables.css';
import '../../../packages/react/src/styles/reset.css';
import '../../../packages/react/src/themes/all.css';
import '../../../packages/layout/src/index.css';

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