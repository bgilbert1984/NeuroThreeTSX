import { useEffect, useState } from 'react';

export interface ControllerInputs {
  leftStick: { x: number, y: number };
  rightStick: { x: number, y: number };
  leftTrigger: number;
  rightTrigger: number;
  buttons: {
    a: boolean;
    b: boolean;
    x: boolean;
    y: boolean;
    lb: boolean; 
    rb: boolean;
    back: boolean;
    start: boolean;
    leftStickPress: boolean;
    rightStickPress: boolean;
    dpadUp: boolean;
    dpadDown: boolean;
    dpadLeft: boolean;
    dpadRight: boolean;
  };
  connected: boolean;
}

const defaultInputs: ControllerInputs = {
  leftStick: { x: 0, y: 0 },
  rightStick: { x: 0, y: 0 },
  leftTrigger: 0,
  rightTrigger: 0,
  buttons: {
    a: false,
    b: false,
    x: false,
    y: false,
    lb: false,
    rb: false,
    back: false,
    start: false,
    leftStickPress: false,
    rightStickPress: false,
    dpadUp: false,
    dpadDown: false,
    dpadLeft: false,
    dpadRight: false,
  },
  connected: false
};

// Button mapping for Xbox controller (standard mapping)
const BUTTON_MAPPING = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6, // Also accessible as analog
  RT: 7, // Also accessible as analog
  BACK: 8,
  START: 9,
  LEFT_STICK_PRESS: 10,
  RIGHT_STICK_PRESS: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15
};

// Controller axes mapping
const AXES_MAPPING = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3
};

export const useXboxController = (deadzone = 0.1): ControllerInputs => {
  const [inputs, setInputs] = useState<ControllerInputs>(defaultInputs);
  
  useEffect(() => {
    const handleGamepadConnected = (event: GamepadEvent) => {
      console.log('Gamepad connected:', event.gamepad.id);
    };
    
    const handleGamepadDisconnected = (event: GamepadEvent) => {
      console.log('Gamepad disconnected:', event.gamepad.id);
      if (isXboxController(event.gamepad)) {
        setInputs(defaultInputs);
      }
    };
    
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    
    // Poll for gamepad state
    let animationFrameId: number;
    
    const updateGamepadState = () => {
      const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
      const xboxController = gamepads.find(isXboxController);
      
      if (xboxController) {
        const newInputs: ControllerInputs = {
          leftStick: {
            x: applyDeadzone(xboxController.axes[AXES_MAPPING.LEFT_STICK_X], deadzone),
            y: applyDeadzone(xboxController.axes[AXES_MAPPING.LEFT_STICK_Y], deadzone)
          },
          rightStick: {
            x: applyDeadzone(xboxController.axes[AXES_MAPPING.RIGHT_STICK_X], deadzone),
            y: applyDeadzone(xboxController.axes[AXES_MAPPING.RIGHT_STICK_Y], deadzone)
          },
          leftTrigger: xboxController.buttons[BUTTON_MAPPING.LT]?.value || 0,
          rightTrigger: xboxController.buttons[BUTTON_MAPPING.RT]?.value || 0,
          buttons: {
            a: xboxController.buttons[BUTTON_MAPPING.A]?.pressed || false,
            b: xboxController.buttons[BUTTON_MAPPING.B]?.pressed || false,
            x: xboxController.buttons[BUTTON_MAPPING.X]?.pressed || false,
            y: xboxController.buttons[BUTTON_MAPPING.Y]?.pressed || false,
            lb: xboxController.buttons[BUTTON_MAPPING.LB]?.pressed || false,
            rb: xboxController.buttons[BUTTON_MAPPING.RB]?.pressed || false,
            back: xboxController.buttons[BUTTON_MAPPING.BACK]?.pressed || false,
            start: xboxController.buttons[BUTTON_MAPPING.START]?.pressed || false,
            leftStickPress: xboxController.buttons[BUTTON_MAPPING.LEFT_STICK_PRESS]?.pressed || false,
            rightStickPress: xboxController.buttons[BUTTON_MAPPING.RIGHT_STICK_PRESS]?.pressed || false,
            dpadUp: xboxController.buttons[BUTTON_MAPPING.DPAD_UP]?.pressed || false,
            dpadDown: xboxController.buttons[BUTTON_MAPPING.DPAD_DOWN]?.pressed || false,
            dpadLeft: xboxController.buttons[BUTTON_MAPPING.DPAD_LEFT]?.pressed || false,
            dpadRight: xboxController.buttons[BUTTON_MAPPING.DPAD_RIGHT]?.pressed || false,
          },
          connected: true
        };
        
        setInputs(newInputs);
      }
      
      animationFrameId = requestAnimationFrame(updateGamepadState);
    };
    
    animationFrameId = requestAnimationFrame(updateGamepadState);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [deadzone]);
  
  return inputs;
};

// Helper functions
const isXboxController = (gamepad: Gamepad | null): boolean => {
  if (!gamepad) return false;
  
  // Check if it's an Xbox controller or using standard mapping
  return (
    gamepad.id.toLowerCase().includes('xbox') || 
    gamepad.mapping === 'standard'
  );
};

const applyDeadzone = (value: number, deadzone: number): number => {
  if (Math.abs(value) < deadzone) {
    return 0;
  }
  
  // Rescale the values to be proportional from deadzone to 1.0
  return value > 0 
    ? (value - deadzone) / (1 - deadzone)
    : (value + deadzone) / (1 - deadzone);
};

// Usage example
// const MyComponent = () => {
//   const controller = useXboxController();
//   
//   useEffect(() => {
//     if (controller.buttons.a) {
//       console.log('A button pressed!');
//     }
//     
//     if (Math.abs(controller.leftStick.x) > 0 || Math.abs(controller.leftStick.y) > 0) {
//       console.log('Moving with left stick:', controller.leftStick);
//     }
//   }, [controller]);
//   
//   return (
//     <div>
//       <p>Controller {controller.connected ? 'connected' : 'disconnected'}</p>
//     </div>
//   );
// };
