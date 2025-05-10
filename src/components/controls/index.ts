/**
 * UI Controls Index
 *
 * Purpose: Exports all UI control components
 * Author: Cody
 * Creation Date: 2023-11-16
 */

// Export control components
export * from './controlBase';
export * from './slider';
export * from './radioGroup';
export * from './select';
export * from './textInput';
export * from './checkbox';
export * from './colorInput';
export * from './dashboard';

// Register all control components
import { registerControlBaseComponent } from './controlBase';
import { registerSliderComponent } from './slider';
import { registerRadioGroupComponent } from './radioGroup';
import { registerSelectComponent } from './select';
import { registerTextInputComponent } from './textInput';
import { registerCheckboxComponent } from './checkbox';
import { registerColorInputComponent } from './colorInput';
import { registerDashboardComponent } from './dashboard';

export function registerAllControlComponents() {
  registerControlBaseComponent();
  registerSliderComponent();
  registerRadioGroupComponent();
  registerSelectComponent();
  registerTextInputComponent();
  registerCheckboxComponent();
  registerColorInputComponent();
  registerDashboardComponent();

  console.log('All UI control components registered');
}
